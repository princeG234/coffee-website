import { useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  CartIcon,
  LocationIcon,
  TruckIcon,
  TicketIcon,
  NoteIcon,
  ShieldIcon,
  CashIcon,
  WalletIcon,
  CreditCardIcon,
  BankIcon,
  EditIcon,
  LockIcon,
} from "../components/Icons";
import ProductImage from "../components/ProductImage";
import { formatINR, usdToINR, formatINRValue } from "../utils/format";
import SectionHeader from "../components/SectionHeader";

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", icon: CashIcon },
  { id: "upi", label: "UPI", icon: WalletIcon },
  { id: "card", label: "Debit / Credit Card", icon: CreditCardIcon },
  { id: "netbanking", label: "Net Banking", icon: BankIcon },
  { id: "wallet", label: "Wallet", icon: WalletIcon },
];

const DELIVERY_OPTIONS = [
  { id: "standard", label: "Standard Delivery", time: "3-5 business days", fee: 40 },
  { id: "express", label: "Express Delivery", time: "1-2 business days", fee: 120 },
];

const COUPONS = {
  SAVE10: { discount: 0.1, label: "10% off on your order" },
  BLISS50: { discount: 50, label: "₹50 flat off" },
  FREESHIP: { discount: "freeship", label: "Free delivery" },
};

const NOTE_SUGGESTIONS = [
  "Less sugar",
  "Extra hot coffee",
  "Call before delivery",
  "No ice",
  "Extra caramel",
];

const formatDate = (daysFromNow) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, subtotal, clearCart } = useCart();
  const { user, addOrder } = useAuth();

  const [address, setAddress] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    house: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [addressErrors, setAddressErrors] = useState({});
  const [delivery, setDelivery] = useState("standard");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponAppliedMsg, setCouponAppliedMsg] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [bankName, setBankName] = useState("");
  const [walletName, setWalletName] = useState("");
  const [notes, setNotes] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(true);

  const subtotalINR = Math.round(usdToINR(subtotal) * 100) / 100;
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const deliveryFee = delivery === "express" ? 120 : 40;
  const gst = Math.round(subtotalINR * 0.08 * 100) / 100;

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    const c = COUPONS[appliedCoupon.code];
    if (!c) return 0;
    if (c.discount === "freeship") return 0; // delivery is already waived by effectiveDeliveryFee
    if (c.discount > 0 && c.discount < 1) return Math.round(subtotalINR * c.discount * 100) / 100;
    return Math.min(c.discount, subtotalINR);
  }, [appliedCoupon, subtotalINR]);

  const effectiveDeliveryFee = appliedCoupon?.code === "FREESHIP" ? 0 : deliveryFee;
  const total = Math.round((subtotalINR + effectiveDeliveryFee - discountAmount + gst) * 100) / 100;
  const deliveryDate = delivery === "express" ? formatDate(3) : formatDate(6);

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
    setAddressErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validateAddress = () => {
    const errs = {};
    if (!address.name.trim()) errs.name = "Full name is required";
    if (!address.phone.trim()) errs.phone = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(address.phone.replace(/\D/g, ""))) errs.phone = "Enter a valid 10-digit mobile number";
    if (!address.house.trim()) errs.house = "House/Flat No. is required";
    if (!address.area.trim()) errs.area = "Area/Street is required";
    if (!address.city.trim()) errs.city = "City is required";
    if (!address.state.trim()) errs.state = "State is required";
    if (!/^\d{6}$/.test(address.pincode.trim())) errs.pincode = "Enter a valid 6-digit pincode";
    return errs;
  };

  const validatePayment = () => {
    const errs = {};
    if (paymentMethod === "upi" && !/^[\w.]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) errs.upi = "Enter a valid UPI ID (e.g. name@upi)";
    if (paymentMethod === "card") {
      if (!/^\d{16}$/.test(card.number.replace(/\s/g, ""))) errs.cardNumber = "Enter a valid 16-digit card number";
      if (!/^\d{2}\/\d{2}$/.test(card.expiry.trim())) errs.cardExpiry = "Use MM/YY";
      if (!/^\d{3}$/.test(card.cvv.trim())) errs.cardCvv = "3-digit CVV";
    }
    if (paymentMethod === "netbanking" && !bankName) errs.bank = "Select your bank";
    if (paymentMethod === "wallet" && !walletName) errs.wallet = "Select your wallet";
    return errs;
  };

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code");
      return;
    }
    const coupon = COUPONS[code];
    if (!coupon) {
      setCouponError("Invalid coupon code");
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon({ code, ...coupon });
    setCouponError("");
    setCouponAppliedMsg("Coupon applied successfully!");
    setTimeout(() => setCouponAppliedMsg(""), 3000);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const handlePlaceOrder = async () => {
    setSubmitError("");
    const addrErrs = validateAddress();
    if (Object.keys(addrErrs).length > 0) {
      setAddressErrors(addrErrs);
      setShowAddressForm(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const payErrs = validatePayment();
    if (Object.keys(payErrs).length > 0) {
      setSubmitError("Please complete the payment details.");
      return;
    }

    if (!agreed) {
      setSubmitError("Please agree to the terms & conditions.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customer: { name: address.name, phone: address.phone, email: user?.email || "" },
        address: {
          house: address.house,
          area: address.area,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        },
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          desc: i.desc,
          price: i.price,
          emoji: i.emoji,
          image: i.image,
          quantity: i.quantity,
          selectedIngredients: i.selectedIngredients || [],
        })),
        payment: {
          method: paymentMethod,
          details:
            paymentMethod === "upi"
              ? upiId
              : paymentMethod === "card"
              ? { last4: card.number.replace(/\s/g, "").slice(-4), name: card.name }
              : paymentMethod === "netbanking"
              ? bankName
              : paymentMethod === "wallet"
              ? walletName
              : "Pay on delivery",
        },
        delivery: {
          type: delivery,
          label: DELIVERY_OPTIONS.find((d) => d.id === delivery)?.label,
          expectedDate: deliveryDate,
          fee: effectiveDeliveryFee,
        },
        coupon: appliedCoupon ? { code: appliedCoupon.code } : null,
        notes: notes.trim(),
        subtotal: subtotalINR,
        deliveryFee: effectiveDeliveryFee,
        discount: discountAmount,
        gst,
        total,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to place order");
      }

      if (user) {
        addOrder({
          id: data.data.orderId,
          orderId: data.data.orderId,
          items: items.map((i) => i.name),
          total,
          date: new Date().toLocaleDateString("en-IN"),
          status: "Processing",
        });
      }

      clearCart();
      navigate("/order-success", { state: { order: data.data } });
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cardHeader = (icon, title, desc) => (
    <div className="checkout-card-header">
      <span className="checkout-card-icon">{icon}</span>
      <div className="checkout-card-title">
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </div>
  );

  if (!user) {
    return (
      <section className="checkout-page section-padding bg-light">
        <div className="container">
          <div className="checkout-login-gate">
            <div className="checkout-login-icon">
              <LockIcon size={56} />
            </div>
            <h2>Sign in to Checkout</h2>
            <p>
              You need to be signed in to place your order. Your cart items are saved — sign in or create an account to continue.
            </p>
            <div className="checkout-login-actions">
              <Link to="/login" state={{ from: location.pathname }} className="btn btn-primary">
                Sign In
              </Link>
              <Link to="/register" state={{ from: location.pathname }} className="btn btn-outline">
                Create Account
              </Link>
            </div>
            <Link to="/cart" className="checkout-login-back">
              ← Back to Cart
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="checkout-page section-padding bg-light">
        <div className="container">
          <div className="checkout-empty">
            <div className="checkout-empty-icon">
              <CartIcon size={64} />
            </div>
            <h2>Your cart is empty</h2>
            <p>Add some items before proceeding to checkout.</p>
            <Link to="/menu" className="btn btn-primary">
              Browse Menu
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-page section-padding bg-light">
      <div className="container">
        <SectionHeader
          subtitle="Checkout"
          title="Place Your Order"
          desc="Complete your delivery and payment details below"
        />

        <div className="checkout-steps">
          <div className="checkout-step active">
            <span className="checkout-step-num">1</span> Address
          </div>
          <div className="checkout-step-line"></div>
          <div className="checkout-step">
            <span className="checkout-step-num">2</span> Delivery
          </div>
          <div className="checkout-step-line"></div>
          <div className="checkout-step">
            <span className="checkout-step-num">3</span> Payment
          </div>
        </div>

        <div className="checkout-layout">
          {/* LEFT COLUMN */}
          <div className="checkout-main">
            {/* 1. Delivery Address */}
            <div className="checkout-card">
              {cardHeader(<LocationIcon size={20} />, "Delivery Address", "Where should we deliver your order?")}

              {!showAddressForm && (
                <div className="saved-address">
                  <div className="saved-address-info">
                    <strong>{address.name}</strong>
                    <span>{address.phone}</span>
                    <p>{address.house}, {address.area}, {address.city}, {address.state} - {address.pincode}</p>
                  </div>
                  <button className="saved-address-edit" onClick={() => setShowAddressForm(true)}>
                    <EditIcon size={14} /> Edit
                  </button>
                </div>
              )}

              {showAddressForm && (
                <div className="checkout-form-grid two-col">
                  <div className={`checkout-field ${addressErrors.name ? "error" : ""}`}>
                    <label>Full Name</label>
                    <input type="text" name="name" placeholder="Customer name" value={address.name} onChange={handleAddressChange} className={addressErrors.name ? "error" : ""} />
                    {addressErrors.name && <span className="checkout-field-error">{addressErrors.name}</span>}
                  </div>
                  <div className={`checkout-field ${addressErrors.phone ? "error" : ""}`}>
                    <label>Mobile Number</label>
                    <input type="tel" name="phone" placeholder="10-digit mobile number" value={address.phone} onChange={handleAddressChange} className={addressErrors.phone ? "error" : ""} />
                    {addressErrors.phone && <span className="checkout-field-error">{addressErrors.phone}</span>}
                  </div>
                  <div className={`checkout-field ${addressErrors.house ? "error" : ""}`}>
                    <label>House / Flat No.</label>
                    <input type="text" name="house" placeholder="Flat 101, Building A" value={address.house} onChange={handleAddressChange} className={addressErrors.house ? "error" : ""} />
                    {addressErrors.house && <span className="checkout-field-error">{addressErrors.house}</span>}
                  </div>
                  <div className={`checkout-field ${addressErrors.area ? "error" : ""}`}>
                    <label>Area / Street</label>
                    <input type="text" name="area" placeholder="MG Road, Indiranagar" value={address.area} onChange={handleAddressChange} className={addressErrors.area ? "error" : ""} />
                    {addressErrors.area && <span className="checkout-field-error">{addressErrors.area}</span>}
                  </div>
                  <div className={`checkout-field ${addressErrors.city ? "error" : ""}`}>
                    <label>City</label>
                    <input type="text" name="city" placeholder="Bengaluru" value={address.city} onChange={handleAddressChange} className={addressErrors.city ? "error" : ""} />
                    {addressErrors.city && <span className="checkout-field-error">{addressErrors.city}</span>}
                  </div>
                  <div className={`checkout-field ${addressErrors.state ? "error" : ""}`}>
                    <label>State</label>
                    <input type="text" name="state" placeholder="Karnataka" value={address.state} onChange={handleAddressChange} className={addressErrors.state ? "error" : ""} />
                    {addressErrors.state && <span className="checkout-field-error">{addressErrors.state}</span>}
                  </div>
                  <div className={`checkout-field span-2 ${addressErrors.pincode ? "error" : ""}`}>
                    <label>Pincode</label>
                    <input type="text" name="pincode" placeholder="560001" maxLength={6} value={address.pincode} onChange={handleAddressChange} className={addressErrors.pincode ? "error" : ""} />
                    {addressErrors.pincode && <span className="checkout-field-error">{addressErrors.pincode}</span>}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Delivery Options */}
            <div className="checkout-card">
              {cardHeader(<TruckIcon size={20} />, "Delivery Options", "Choose how fast you want your coffee")}
              <div className="delivery-options">
                {DELIVERY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    className={`delivery-option ${delivery === opt.id ? "selected" : ""}`}
                    onClick={() => setDelivery(opt.id)}
                  >
                    <div className="delivery-option-radio">
                      <span className={delivery === opt.id ? "checked" : ""}></span>
                    </div>
                    <div className="delivery-option-info">
                      <strong>{opt.label}</strong>
                      <span>Estimated: {opt.time}</span>
                      <span className="delivery-option-date">Arrives by {formatDate(opt.id === "express" ? 3 : 6)}</span>
                    </div>
                    <div className="delivery-option-fee">{opt.fee === 0 ? "FREE" : formatINRValue(opt.fee)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Coupon Code */}
            <div className="checkout-card">
              {cardHeader(<TicketIcon size={20} />, "Coupon Code", "Apply a coupon to save more")}
              {appliedCoupon ? (
                <div className="coupon-applied">
                  <div className="coupon-applied-info">
                    <strong>{appliedCoupon.code}</strong>
                    <span>{appliedCoupon.label}</span>
                  </div>
                  <button className="coupon-remove-btn" onClick={handleRemoveCoupon}>Remove</button>
                </div>
              ) : (
                <div className="coupon-input-row">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      setCouponError("");
                    }}
                  />
                  <button className="coupon-apply-btn" onClick={handleApplyCoupon}>Apply</button>
                </div>
              )}
              {couponError && <div className="coupon-message error">{couponError}</div>}
              {couponAppliedMsg && <div className="coupon-message success">{couponAppliedMsg}</div>}
              <div className="coupon-hints">
                <span>Try: SAVE10 (10% off)</span>
                <span>BLISS50 (₹50 off)</span>
                <span>FREESHIP (free delivery)</span>
              </div>
            </div>

            {/* 4. Payment Method */}
            <div className="checkout-card">
              {cardHeader(<CreditCardIcon size={20} />, "Payment Method", "Choose how you'd like to pay")}
              <div className="payment-methods">
                {PAYMENT_METHODS.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      className={`payment-method ${paymentMethod === m.id ? "selected" : ""}`}
                      onClick={() => setPaymentMethod(m.id)}
                    >
                      <Icon size={20} />
                      <span>{m.label}</span>
                      <span className={`payment-radio ${paymentMethod === m.id ? "check" : ""}`}>
                        <span className={paymentMethod === m.id ? "checked" : ""}></span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {paymentMethod === "upi" && (
                <div className="payment-details">
                  <div className="checkout-field">
                    <label>UPI ID</label>
                    <input type="text" placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                  </div>
                  <p className="payment-note">You'll receive a collect request on your UPI app to complete the payment.</p>
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="payment-details">
                  <div className="checkout-field">
                    <label>Name on Card</label>
                    <input type="text" placeholder="Name as on card" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
                  </div>
                  <div className="checkout-field">
                    <label>Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" maxLength={19} value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} />
                  </div>
                  <div className="checkout-form-grid two-col">
                    <div className="checkout-field">
                      <label>Expiry (MM/YY)</label>
                      <input type="text" placeholder="09/27" maxLength={5} value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
                    </div>
                    <div className="checkout-field">
                      <label>CVV</label>
                      <input type="password" placeholder="123" maxLength={3} value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
                    </div>
                  </div>
                  <p className="payment-note"><ShieldIcon size={14} /> Demo checkout only. Please do not enter real card details.</p>
                </div>
              )}

              {paymentMethod === "netbanking" && (
                <div className="payment-details">
                  <div className="checkout-field">
                    <label>Select Bank</label>
                    <select value={bankName} onChange={(e) => setBankName(e.target.value)}>
                      <option value="">-- Choose your bank --</option>
                      <option>State Bank of India</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                      <option>Punjab National Bank</option>
                    </select>
                  </div>
                </div>
              )}

              {paymentMethod === "wallet" && (
                <div className="payment-details">
                  <div className="checkout-field">
                    <label>Select Wallet</label>
                    <select value={walletName} onChange={(e) => setWalletName(e.target.value)}>
                      <option value="">-- Choose your wallet --</option>
                      <option>Paytm Wallet</option>
                      <option>PhonePe Wallet</option>
                      <option>Amazon Pay</option>
                      <option>Google Pay Balance</option>
                    </select>
                  </div>
                </div>
              )}

              {paymentMethod === "cod" && (
                <p className="payment-note"><CashIcon size={14} /> Pay in cash when your order is delivered.</p>
              )}
            </div>

            {/* 5. Order Notes */}
            <div className="checkout-card">
              {cardHeader(<NoteIcon size={20} />, "Order Notes (Optional)", "Anything we should know?")}
              <div className="note-suggestions">
                {NOTE_SUGGESTIONS.map((n) => (
                  <button
                    key={n}
                    className={`note-chip ${notes.includes(n) ? "selected" : ""}`}
                    onClick={() =>
                      setNotes((prev) =>
                        prev.includes(n)
                          ? prev.split(",").map((x) => x.trim()).filter((x) => x !== n).join(", ")
                          : prev ? `${prev}, ${n}` : n
                      )
                    }
                  >
                    {n}
                  </button>
                ))}
              </div>
              <textarea className="checkout-textarea" rows={3} placeholder='e.g. "Less sugar", "Call before delivery"...' value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>

          {/* RIGHT COLUMN (Order Summary) */}
          <div className="checkout-summary">
            <div className="checkout-summary-card">
              <h3>Order Summary</h3>
              <div className="summary-items">
                {items.map((item) => (
                  <div key={item.itemKey || item.id} className="summary-item">
                    <div className="summary-item-image">
                      <ProductImage src={item.image} alt={item.name} emoji={item.emoji} />
                      <span className="summary-item-qty">{item.quantity}</span>
                    </div>
                    <div className="summary-item-info">
                      <strong>{item.name}</strong>
                      <span>{formatINR(item.price)} each</span>
                    </div>
                    <span className="summary-item-price">{formatINR(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="summary-total-items">Total items: {totalItems}</div>

              <div className="price-details">
                <h4>Price Details</h4>
                <div className="price-row"><span>Subtotal ({totalItems} items)</span><span>{formatINRValue(subtotalINR)}</span></div>
                <div className="price-row">
                  <span>Delivery Fee</span>
                  <span className={effectiveDeliveryFee === 0 ? "free" : ""}>{effectiveDeliveryFee === 0 ? "FREE" : formatINRValue(effectiveDeliveryFee)}</span>
                </div>
                <div className="price-row">
                  <span>Discount</span>
                  <span className="discount">{discountAmount > 0 ? `- ${formatINRValue(discountAmount)}` : formatINRValue(0)}</span>
                </div>
                <div className="price-row"><span>Tax (GST 8%)</span><span>{formatINRValue(gst)}</span></div>
                <div className="price-divider"></div>
                <div className="price-row total"><span>Total</span><span>{formatINRValue(total)}</span></div>
              </div>

              <label className="terms-checkbox">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <span>I agree to the <strong>terms and conditions</strong>.</span>
              </label>

              {submitError && <div className="checkout-submit-error">{submitError}</div>}

              <button className="btn btn-primary place-order-btn" onClick={handlePlaceOrder} disabled={loading}>
                {loading ? "Processing..." : (<><ShieldIcon size={18} /> Place Order · {formatINRValue(total)}</>)}
              </button>
              <p className="secure-note"><ShieldIcon size={14} /> Demo checkout - no real payment is taken</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Checkout;
