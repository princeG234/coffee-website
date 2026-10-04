import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BagIcon, TruckIcon, UserIcon, LocationIcon, ClockIcon, CreditCardIcon } from "../components/Icons";
import { formatINRValue } from "../utils/format";
import SectionHeader from "../components/SectionHeader";

const STATUS_CLASSES = {
  confirmed: "confirmed",
  processing: "processing",
  "on the way": "onway",
  delivered: "delivered",
  cancelled: "cancelled",
};

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem("brewbliss_admin_key") || "");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [inputKey, setInputKey] = useState("");
  const [keyError, setKeyError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const fetchOrders = async (key) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/orders", {
        headers: {
          "X-Admin-Key": key,
        },
      });
      const data = await res.json();
      if (res.status === 403) {
        setIsUnlocked(false);
        sessionStorage.removeItem("brewbliss_admin_key");
        setError("Invalid Admin Secret Key. Access Denied.");
        return false;
      }
      if (data.success) {
        setOrders(data.data);
        setIsUnlocked(true);
        sessionStorage.setItem("brewbliss_admin_key", key);
        return true;
      } else {
        setError(data.message || "Failed to load orders");
        return false;
      }
    } catch {
      setError("Could not connect to the server. Make sure the backend is running.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminKey) {
      fetchOrders(adminKey);
    } else {
      setLoading(false);
    }
  }, [adminKey]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      setKeyError("Please enter the Admin Secret Key");
      return;
    }
    setVerifying(true);
    setKeyError("");
    const success = await fetchOrders(inputKey.trim());
    if (success) {
      setAdminKey(inputKey.trim());
      setInputKey("");
    } else {
      setKeyError("Invalid Secret Key. Access denied.");
    }
    setVerifying(false);
  };

  const handleLock = () => {
    sessionStorage.removeItem("brewbliss_admin_key");
    setAdminKey("");
    setIsUnlocked(false);
    setOrders([]);
  };

  const paymentLabel = (method) => {
    const map = {
      cod: "Cash on Delivery",
      upi: "UPI",
      card: "Card",
      netbanking: "Net Banking",
      wallet: "Wallet",
    };
    return map[method] || method || "—";
  };

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className="admin-page section-padding bg-light">
      <div className="container">
        <SectionHeader
          subtitle="Admin Dashboard"
          title="Order Management"
          desc="Monitor all incoming orders in real-time"
        />

        {!isUnlocked ? (
          <div
            style={{
              maxWidth: "460px",
              margin: "3rem auto",
              padding: "2.5rem",
              background: "var(--surface, #fff)",
              borderRadius: "16px",
              border: "1px solid var(--border, #e5c9a8)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(184, 115, 51, 0.12)",
                color: "var(--primary, #b87333)",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 1.5rem",
                fontSize: "28px",
              }}
            >
              🔒
            </div>
            <h3 style={{ margin: "0 0 0.5rem", color: "var(--text, #3a2a25)" }}>
              Admin Authorization Required
            </h3>
            <p
              style={{
                color: "var(--text-muted, #7a6b63)",
                fontSize: "0.92rem",
                marginBottom: "1.5rem",
                lineHeight: "1.5",
              }}
            >
              To protect customer data and order details, please enter the Admin Secret Key.
            </p>

            <form onSubmit={handleUnlock} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input
                type="password"
                placeholder="Enter Admin Secret Key"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                style={{
                  padding: "0.85rem 1rem",
                  borderRadius: "10px",
                  border: "1px solid var(--border, #d1c1b1)",
                  fontSize: "1rem",
                  outline: "none",
                  textAlign: "center",
                  letterSpacing: "1px",
                }}
              />
              {keyError && (
                <div
                  style={{
                    color: "#d9534f",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                  }}
                >
                  {keyError}
                </div>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={verifying}
                style={{ padding: "0.85rem", fontSize: "1rem", fontWeight: "600" }}
              >
                {verifying ? "Verifying..." : "Unlock Dashboard 🔓"}
              </button>
            </form>

            <div
              style={{
                marginTop: "1.5rem",
                padding: "0.75rem",
                background: "rgba(0,0,0,0.02)",
                borderRadius: "8px",
                fontSize: "0.8rem",
                color: "var(--text-muted, #8a7a72)",
              }}
            >
              Dev Key: <code>brewbliss_secret_admin_2026</code>
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(184, 115, 51, 0.08)",
                border: "1px solid rgba(184, 115, 51, 0.2)",
                padding: "0.75rem 1.25rem",
                borderRadius: "12px",
                marginBottom: "2rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ color: "#28a745", fontWeight: "bold" }}>●</span>
                <span style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--text, #3a2a25)" }}>
                  Admin Authenticated & Secure Session Active
                </span>
              </div>
              <button
                onClick={handleLock}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border, #ccc)",
                  padding: "0.4rem 0.9rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                }}
              >
                Lock Dashboard 🔒
              </button>
            </div>

            {/* Stats */}
            <div className="admin-stats">
              <div className="admin-stat">
                <span className="admin-stat-icon">
                  <BagIcon size={22} />
                </span>
                <div>
                  <strong>{orders.length}</strong>
                  <span>Total Orders</span>
                </div>
              </div>
          <div className="admin-stat">
            <span className="admin-stat-icon">
              <CreditCardIcon size={22} />
            </span>
            <div>
              <strong>{formatINRValue(totalRevenue)}</strong>
              <span>Total Revenue</span>
            </div>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-icon">
              <TruckIcon size={22} />
            </span>
            <div>
              <strong>{orders.filter((o) => o.status === "confirmed").length}</strong>
              <span>New Orders</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-filters">
          {["all", "confirmed", "processing", "delivered", "cancelled"].map((f) => (
            <button
              key={f}
              className={`admin-filter ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading && (
          <div className="admin-empty">
            <p>Loading orders...</p>
          </div>
        )}

        {error && (
          <div className="admin-empty">
            <p>{error}</p>
            <Link to="/menu" className="btn btn-primary">
              Back to Store
            </Link>
          </div>
        )}

        {!loading && !error && filteredOrders.length === 0 && (
          <div className="admin-empty">
            <BagIcon size={48} />
            <h3>No orders found</h3>
            <p>New orders placed on the checkout page will appear here instantly.</p>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="admin-orders">
            {filteredOrders.map((order) => (
              <div key={order.orderId || order.id} className="admin-order">
                <div className="admin-order-header">
                  <div className="admin-order-id">
                    <strong>{order.orderId}</strong>
                    <span>
                      <ClockIcon size={13} /> {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <span className={`admin-order-status ${STATUS_CLASSES[order.status] || "default"}`}>
                    {order.status}
                  </span>
                </div>

                <div className="admin-order-body">
                  <div className="admin-order-section">
                    <h5><UserIcon size={14} /> Customer</h5>
                    <p>
                      <strong>{order.customer?.name}</strong>
                      <br />
                      {order.customer?.phone}
                      {order.customer?.email && <><br />{order.customer.email}</>}
                    </p>
                  </div>

                  <div className="admin-order-section">
                    <h5><LocationIcon size={14} /> Delivery Address</h5>
                    <p>
                      {order.address?.house}, {order.address?.area}
                      <br />
                      {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                    </p>
                  </div>

                  <div className="admin-order-section">
                    <h5><BagIcon size={14} /> Items</h5>
                    <div className="admin-order-items">
                      {order.items?.map((item, idx) => (
                        <span key={idx} className="admin-order-item">
                          {item.name} × {item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="admin-order-section">
                    <h5><CreditCardIcon size={14} /> Payment</h5>
                    <p>{paymentLabel(order.payment?.method)}</p>
                    {order.payment?.details && (
                      <span className="admin-payment-detail">
                        {typeof order.payment.details === "object"
                          ? `•••• •••• •••• ${order.payment.details.last4 || ""}`
                          : order.payment.details}
                      </span>
                    )}
                    {order.delivery && (
                      <p className="admin-delivery">
                        <TruckIcon size={13} /> {order.delivery.label} · Arrives {order.delivery.expectedDate}
                      </p>
                    )}
                  </div>
                </div>

                <div className="admin-order-footer">
                  {order.notes && <span className="admin-order-notes">Note: {order.notes}</span>}
                  <div className="admin-order-total">
                    <span>Total</span>
                    <strong>{formatINRValue(order.total)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </>
        )}
      </div>
    </section>
  );
};

export default Admin;
