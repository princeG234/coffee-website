const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

// Load environment variables from backend/.env
try {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
} catch {
  // Ignore
}

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers & Request Body Limits
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// ===== Security: Rate Limiting & Admin Access Control =====
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', generalLimiter);

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many OTP requests. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many messages sent. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin Authentication Middleware (Blocks unauthorized data leak of customer orders & messages)
const requireAdminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
  const expectedKey = process.env.ADMIN_SECRET_KEY || 'brewbliss_secret_admin_2026';
  if (!adminKey || adminKey !== expectedKey) {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Valid Admin Secret Key required.',
    });
  }
  next();
};

// Input sanitizer (strips HTML and script tags to prevent XSS)
const sanitizeText = (str) => (typeof str === 'string' ? str.replace(/<[^>]*>?/gm, '').trim() : '');

// ===== Email / OTP configuration =====
// Configure SMTP via backend/.env:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
const smtpConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = smtpConfigured
  ? nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || (process.env.SMTP_HOST ? undefined : 'gmail'),
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) === 465 || !process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '',
    },
  })
  : null;

// In-memory OTP store: email -> { otp, expiresAt, verified }
const otpStore = new Map();

const generateOtpCode = () => {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
};

const sendOtpEmail = async (email, otpCode) => {
  if (smtpConfigured && transporter) {
    console.log(`[SMTP] Sending real OTP email to ${email}...`);
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Brew Bliss Coffee" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Your Brew Bliss Password Reset OTP: ${otpCode}`,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:auto;border:1px solid #e5c9a8;border-radius:12px;overflow:hidden">
          <div style="background:#3a2a25;padding:20px;text-align:center">
            <span style="color:#e0b673;font-size:22px;font-weight:bold">☕ Brew Bliss</span>
          </div>
          <div style="padding:28px">
            <h2 style="color:#3a2a25;margin:0 0 12px">Reset Your Password</h2>
            <p style="color:#5a4a42;font-size:15px;line-height:1.6">
              We received a request to reset your password. Use the OTP below to verify your email.
              This code is valid for <strong>10 minutes</strong>.
            </p>
            <div style="background:#f7efe4;border-radius:8px;padding:20px;text-align:center;margin:20px 0">
              <span style="font-size:32px;letter-spacing:8px;font-weight:bold;color:#3a2a25">${otpCode}</span>
            </div>
            <p style="color:#8a7a72;font-size:13px;line-height:1.5">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });
    console.log(`[SMTP] Real OTP email successfully sent to ${email}!`);
  } else {
    // No SMTP configured — log the OTP so the flow can be tested.
    console.log(`\n[OTP] ${email} -> ${otpCode} (valid 10 min) [SMTP not configured]\n`);
  }
};

// ===== OTP ROUTES =====

// POST /api/auth/request-otp - Generate + send OTP to the given email
app.post('/api/auth/request-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    const otpCode = generateOtpCode();
    otpStore.set(email.toLowerCase(), {
      otp: otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      verified: false,
    });

    try {
      await sendOtpEmail(email, otpCode);
    } catch (err) {
      console.error('Failed to send OTP email:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to send OTP email: ' + err.message });
    }

    res.json({
      success: true,
      message: smtpConfigured
        ? 'Real OTP email dispatched to your inbox!'
        : 'OTP generated. Please check screen or server console.',
      demoOtp: otpCode,
      isRealEmailSent: smtpConfigured,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/verify-otp - Verify the OTP for an email
app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const record = otpStore.get(email.toLowerCase());
    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP was requested for this email' });
    }
    if (record.expiresAt < Date.now()) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }
    if (record.otp !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP. Please try again.' });
    }

    record.verified = true;
    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Path to data file
const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    messages: [],
    menuItems: [
      { id: 1, name: "Classic Espresso", desc: "Double shot of our signature blend", price: 3.50, emoji: "☕", category: "espresso" },
      { id: 2, name: "Espresso Macchiato", desc: "Espresso with a dollop of foam", price: 4.00, emoji: "☕", category: "espresso" },
      { id: 3, name: "Espresso Con Panna", desc: "Espresso topped with whipped cream", price: 4.50, emoji: "☕", category: "espresso" },
      { id: 4, name: "Cold Brew", desc: "24-hour steeped, ultra-smooth", price: 5.00, emoji: "🧊", category: "cold" },
      { id: 5, name: "Nitro Cold Brew", desc: "Cold brew infused with nitrogen", price: 6.00, emoji: "🧊", category: "cold" },
      { id: 6, name: "Cold Brew Latte", desc: "Cold brew with oat milk", price: 5.50, emoji: "🥛", category: "cold" },
      { id: 7, name: "Caramel Macchiato", desc: "Vanilla and caramel layered latte", price: 6.00, emoji: "🍮", category: "specialty" },
      { id: 8, name: "Mocha Delight", desc: "Rich chocolate and espresso", price: 6.50, emoji: "🍫", category: "specialty" },
      { id: 9, name: "Lavender Latte", desc: "Floral notes with steamed milk", price: 6.50, emoji: "🌸", category: "specialty" },
      { id: 10, name: "Cinnamon Roll", desc: "Freshly baked, cream cheese icing", price: 4.50, emoji: "🥐", category: "pastry" },
      { id: 11, name: "Blueberry Muffin", desc: "Made with fresh blueberries", price: 4.00, emoji: "🧁", category: "pastry" },
      { id: 12, name: "Croissant", desc: "Buttery, flaky perfection", price: 3.50, emoji: "🥐", category: "pastry" },
      { id: 13, name: "Everything Bagel", desc: "Toasted bagel with cream cheese", price: 3.50, emoji: "🥯", category: "bakery" },
      { id: 14, name: "Sourdough Loaf", desc: "Artisan sourdough, crusty & chewy", price: 6.00, emoji: "🍞", category: "bakery" },
      { id: 15, name: "Chocolate Chip Cookie", desc: "Soft-baked with dark chocolate chips", price: 3.00, emoji: "🍪", category: "bakery" },
      { id: 16, name: "Glazed Donut", desc: "Classic yeast donut with sweet glaze", price: 3.00, emoji: "🍩", category: "bakery" },
      { id: 17, name: "Fudgy Brownie", desc: "Rich, dense, and extra chocolatey", price: 3.50, emoji: "🍫", category: "bakery" },
      { id: 18, name: "Banana Bread", desc: "Moist loaf with toasted walnuts", price: 4.00, emoji: "🍌", category: "bakery" },
      { id: 19, name: "Apple Pie Slice", desc: "Flaky crust with spiced apples", price: 4.50, emoji: "🥧", category: "bakery" },
      { id: 20, name: "Cheddar Scone", desc: "Savory scone with sharp cheddar", price: 4.00, emoji: "🧀", category: "bakery" },
      { id: 21, name: "Chocolate Croissant", desc: "Flaky croissant filled with dark chocolate", price: 4.00, emoji: "🥐", category: "pastry" },
      { id: 22, name: "Almond Croissant", desc: "Buttery croissant with almond frangipane", price: 4.50, emoji: "🥐", category: "pastry" },
      { id: 23, name: "Classic Baguette", desc: "Crusty French baguette, baked daily", price: 5.00, emoji: "🥖", category: "bakery" },
      { id: 24, name: "Cinnamon Sugar Donut", desc: "Fresh donut rolled in cinnamon sugar", price: 3.00, emoji: "🍩", category: "bakery" },
      { id: 25, name: "Chocolate Glazed Donut", desc: "Yeast donut with glossy chocolate glaze", price: 3.50, emoji: "🍩", category: "bakery" },
      { id: 26, name: "Blueberry Bagel", desc: "Soft bagel studded with blueberries", price: 3.50, emoji: "🥯", category: "bakery" },
      { id: 27, name: "Garlic Bread", desc: "Toasted bread with garlic butter & herbs", price: 4.50, emoji: "🧄", category: "bakery" },
      { id: 28, name: "Soft Pretzel", desc: "Warm pretzel with flaky sea salt", price: 3.50, emoji: "🥨", category: "bakery" },
      { id: 29, name: "Carrot Cake Slice", desc: "Spiced cake with cream cheese frosting", price: 5.00, emoji: "🥕", category: "bakery" },
      { id: 30, name: "Red Velvet Cake", desc: "Velvety red cake with cream cheese icing", price: 6.00, emoji: "🍰", category: "bakery" },
      { id: 31, name: "New York Cheesecake", desc: "Classic dense cheesecake with graham crust", price: 6.50, emoji: "🍰", category: "bakery" },
      { id: 32, name: "Lemon Tart", desc: "Tangy lemon curd in a buttery tart shell", price: 4.50, emoji: "🍋", category: "pastry" },
      { id: 33, name: "Tiramisu", desc: "Layered espresso-soaked mascarpone dessert", price: 5.50, emoji: "🍰", category: "bakery" },
      { id: 34, name: "Macaron Box", desc: "Assorted French macarons (6 pieces)", price: 6.00, emoji: "🧁", category: "bakery" }
    ]
  }, null, 2));
}

// Helper: Read data
const readData = () => {
  const raw = fs.readFileSync(DATA_FILE);
  return JSON.parse(raw);
};

// Helper: Write data
const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// ===== API Routes =====

// GET /api/menu - Get all menu items
app.get('/api/menu', (req, res) => {
  try {
    const data = readData();
    const { category } = req.query;

    let items = data.menuItems;
    if (category && category !== 'all') {
      items = items.filter(item => item.category === category);
    }

    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/contact - Submit contact form (with rate limiting & sanitization)
app.post('/api/contact', contactLimiter, (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    const data = readData();

    const newMessage = {
      id: Date.now(),
      name: sanitizeText(name),
      email: sanitizeText(email).toLowerCase(),
      message: sanitizeText(message),
      createdAt: new Date().toISOString()
    };

    data.messages.push(newMessage);
    writeData(data);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/messages - Get all contact messages (Protected with Admin Auth)
app.get('/api/messages', requireAdminAuth, (req, res) => {
  try {
    const data = readData();
    res.json({ success: true, data: data.messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper: Generate a friendly order ID like BB-7K2M9X
const generateOrderId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BB-${code}`;
};

// POST /api/orders - Place a new order with Server-Side Price Verification
app.post('/api/orders', (req, res) => {
  try {
    const {
      customer,
      address,
      items,
      payment,
      delivery,
      coupon,
      notes,
      total
    } = req.body;

    // Validation
    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }
    if (!customer || !customer.name || !customer.phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and phone are required'
      });
    }
    if (!address || !address.house || !address.area || !address.city || !address.state || !address.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Complete delivery address is required'
      });
    }
    if (!payment || !payment.method) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }

    const data = readData();

    // SERVER-SIDE PRICE RECALCULATION & VALIDATION (Zero-Trust Security)
    let calculatedSubtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const dbItem = data.menuItems.find((m) => m.id === item.id);
      if (!dbItem) {
        return res.status(400).json({ success: false, message: `Invalid item with ID ${item.id}` });
      }
      // Convert to INR canonical price
      const unitPrice = dbItem.price < 30 ? Math.round(dbItem.price * 83 * 100) / 100 : dbItem.price;
      const quantity = Math.max(1, Number(item.quantity) || 1);
      calculatedSubtotal += unitPrice * quantity;
      verifiedItems.push({
        id: dbItem.id,
        name: dbItem.name,
        desc: dbItem.desc,
        price: unitPrice,
        emoji: dbItem.emoji,
        image: dbItem.image,
        quantity,
        selectedIngredients: Array.isArray(item.selectedIngredients) ? item.selectedIngredients : [],
      });
    }
    calculatedSubtotal = Math.round(calculatedSubtotal * 100) / 100;

    // Verify Coupon Server-Side
    let calculatedDiscount = 0;
    const couponCode = coupon?.code ? String(coupon.code).trim().toUpperCase() : null;
    const VALID_COUPONS = {
      FREESHIP: { discount: 'freeship' },
      SAVE10: { discount: 0.10 },
      SAVE20: { discount: 0.20 },
      FLAT50: { discount: 50 },
    };
    if (couponCode && VALID_COUPONS[couponCode]) {
      const c = VALID_COUPONS[couponCode];
      if (c.discount === 'freeship') {
        calculatedDiscount = 0;
      } else if (c.discount > 0 && c.discount < 1) {
        calculatedDiscount = Math.round(calculatedSubtotal * c.discount * 100) / 100;
      } else {
        calculatedDiscount = Math.min(c.discount, calculatedSubtotal);
      }
    }

    // Verify Delivery Fee Server-Side
    const isExpress = delivery?.type === 'express';
    const baseDeliveryFee = isExpress ? 120 : 40;
    const calculatedDeliveryFee = couponCode === 'FREESHIP' ? 0 : baseDeliveryFee;

    // Verify GST (8%) Server-Side
    const calculatedGst = Math.round(calculatedSubtotal * 0.08 * 100) / 100;

    // Authoritative Server Total
    const calculatedTotal = Math.round((calculatedSubtotal + calculatedDeliveryFee - calculatedDiscount + calculatedGst) * 100) / 100;

    // Anti-Tampering Check: Client total cannot be lower than authoritative server calculation
    if (typeof total === 'number' && Math.abs(total - calculatedTotal) > 3) {
      return res.status(400).json({
        success: false,
        message: `Security Alert: Price mismatch detected. Authoritative total is ₹${calculatedTotal}. Order rejected.`,
      });
    }

    const safePayment = { ...payment };
    if (safePayment.method === 'card' && safePayment.details && typeof safePayment.details === 'object') {
      const cardNumber = safePayment.details.number || '';
      safePayment.details = {
        last4: safePayment.details.last4 || (cardNumber ? cardNumber.replace(/\s/g, '').slice(-4) : ''),
        name: sanitizeText(safePayment.details.name || ''),
      };
    }

    const cleanCustomer = {
      name: sanitizeText(customer.name),
      phone: sanitizeText(customer.phone),
      email: sanitizeText(customer.email).toLowerCase(),
    };

    const cleanAddress = {
      house: sanitizeText(address.house),
      area: sanitizeText(address.area),
      city: sanitizeText(address.city),
      state: sanitizeText(address.state),
      pincode: sanitizeText(address.pincode),
    };

    const newOrder = {
      orderId: generateOrderId(),
      customer: cleanCustomer,
      address: cleanAddress,
      items: verifiedItems,
      payment: safePayment,
      delivery,
      coupon: couponCode ? { code: couponCode } : null,
      notes: sanitizeText(notes || ''),
      subtotal: calculatedSubtotal,
      deliveryFee: calculatedDeliveryFee,
      discount: calculatedDiscount,
      gst: calculatedGst,
      total: calculatedTotal,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    if (!data.orders) {
      data.orders = [];
    }
    data.orders.unshift(newOrder);
    writeData(data);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: newOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders - Get all orders (Protected with Admin Auth)
app.get('/api/orders', requireAdminAuth, (req, res) => {
  try {
    const data = readData();
    res.json({ success: true, data: data.orders || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n☕ Brew Bliss Backend Server`);
  console.log(`   Server running on http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   Menu: http://localhost:${PORT}/api/menu`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

