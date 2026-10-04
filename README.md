# ☕ Brew Bliss - Modern Full-Stack Cafe & Bakery Web App

> A premium, full-stack coffee and bakery web application built with **React**, **Node.js/Express**, and **Vanilla CSS**. Features an authentic cafe ordering experience, real-time cart calculations, admin dashboard, server-side anti-fraud security, and OTP password recovery.

---

## ✨ Features

- **☕ Rich Coffee & Bakery Menu:** Interactive categories (Espresso, Cold Brew, Specialty, Pastries, Bakery), real-time search, and price listings in Indian Rupees (₹).
- **🧁 Custom Ingredient Selector:** Add or remove custom ingredients and add-ons before adding to cart.
- **🛒 Real-Time Cart & Accurate Calculations:** 
  - Dynamic subtotal calculation in ₹ (INR).
  - 8% GST (Tax) calculation.
  - Standard Delivery (₹40) vs Express Delivery (₹120).
  - Working Promo Codes: `SAVE10`, `SAVE20`, `FLAT50`, and `FREESHIP`.
  - Clean guest session isolation & automatic cart clearance on logout.
- **💳 Multi-Mode Checkout:** 
  - Strict Indian 10-digit mobile number and 6-digit PIN code validation.
  - Payment options: Cash on Delivery (COD), UPI, Card, Net Banking, and Wallet.
  - Dynamic unique order ID generation (`BB-XXXXXX`).
- **👤 Customer Profile & Order History:** 
  - Past orders display with status badges, delivery dates, and totals.
  - Saved delivery addresses management (Home, Office).
  - Favorites / Wishlist tab.
- **🔒 Protected Admin Dashboard (`/admin`):** 
  - Secured with an **Admin Secret Key** lock screen.
  - Real-time incoming orders overview, customer addresses, contact numbers, and payment details.
  - Status filtering (`Confirmed`, `Processing`, `Delivered`, `Cancelled`) and live revenue analytics.
- **🔐 Forgot Password & OTP Flow:** 
  - 6-digit OTP verification with instant in-browser test card & "Auto-Fill OTP" button.
  - Ready for real Gmail SMTP email delivery via Node.js backend.
- **🛡️ Enterprise-Grade Security & Anti-Hacking:**
  - **Zero-Trust Price Verification:** Server authoritatively recalculates subtotal, discounts, and GST. Blocks price tampering attacks (e.g. attempting to pay ₹1).
  - **Data Leak Prevention:** `GET /api/orders` and `GET /api/messages` protected by `X-Admin-Key` authorization.
  - **Rate Limiting:** Protects against brute-force DoS and OTP spamming via `express-rate-limit`.
  - **XSS & Injection Sanitization:** Form inputs sanitized and secure HTTP headers enforced via `helmet`.
  - **DoS Payload Limits:** 100kb request body limit to prevent RAM flooding.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, React Router v6, Context API, CSS3
- **Backend:** Node.js, Express.js, Helmet, Express-Rate-Limit, Nodemailer
- **Database/Storage:** Local structured JSON store (`backend/data.json`)
- **Styling:** Custom Coffee-Themed Design System (Bronze, Espresso & Cream Palette)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/coffee-website.git
cd coffee-website
```

### 2. Setup & Run the Backend
```bash
cd backend
npm install
node server.js
```
The backend server runs on `http://localhost:5000`.

*(Optional)* Configure SMTP in `backend/.env` for real Gmail OTPs:
```env
PORT=5000
ADMIN_SECRET_KEY=brewbliss_secret_admin_2026
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_google_app_password
```

### 3. Setup & Run the Frontend
Open a new terminal in the project root:
```bash
npm install
npm start
```
The React frontend runs on `http://localhost:3000`.

---

## 🔑 Admin Access
To view real-time orders in the Admin panel:
1. Navigate to `http://localhost:3000/admin`
2. Enter the Admin Secret Key: `brewbliss_secret_admin_2026`
3. Click **Unlock Dashboard**

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
