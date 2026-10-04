import { Link, useLocation } from "react-router-dom";
import {
  CheckIcon,
  TruckIcon,
  LocationIcon,
  CreditCardIcon,
  BagIcon,
  ClockIcon,
} from "../components/Icons";
import { formatINR, formatINRValue } from "../utils/format";

const OrderSuccess = () => {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return (
      <section className="checkout-page section-padding bg-light">
        <div className="container">
          <div className="checkout-empty">
            <div className="checkout-empty-icon">
              <BagIcon size={64} />
            </div>
            <h2>No order found</h2>
            <p>Looks like you haven't placed an order recently.</p>
            <Link to="/menu" className="btn btn-primary">
              Browse Menu
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const paymentLabel = {
    cod: "Cash on Delivery",
    upi: `UPI (${order.payment?.details || ""})`,
    card: "Debit / Credit Card",
    netbanking: `Net Banking (${order.payment?.details || ""})`,
    wallet: `Wallet (${order.payment?.details || ""})`,
  }[order.payment?.method];

  return (
    <section className="checkout-page section-padding bg-light">
      <div className="container">
        <div className="order-success">
          <div className="success-check">
            <CheckIcon size={56} />
          </div>
          <span className="section-subtitle">Order Confirmed</span>
          <h2 className="success-title">Thank You, {order.customer?.name}!</h2>
          <p className="success-desc">
            Your order has been placed successfully.
          </p>

          <div className="success-order-id">
            <span>Order ID</span>
            <strong>{order.orderId}</strong>
          </div>

          <div className="success-details">
            <div className="success-card">
              <h4><BagIcon size={16} /> Order Items</h4>
              <div className="success-items">
                {order.items.map((item, idx) => (
                  <div key={idx} className="success-item">
                    <span>{item.name}{item.quantity > 1 ? ` × ${item.quantity}` : ""}</span>
                    <span>{formatINR(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="success-card">
              <h4><LocationIcon size={16} /> Delivery Address</h4>
              <p className="success-address">
                <strong>{order.customer?.name}</strong> · {order.customer?.phone}
                <br />
                {order.address?.house}, {order.address?.area}, {order.address?.city}, {order.address?.state} - {order.address?.pincode}
              </p>
            </div>

            <div className="success-card">
              <h4><TruckIcon size={16} /> Delivery</h4>
              <p className="success-address">
                {order.delivery?.label}
                <br />
                <ClockIcon size={13} /> Expected delivery: <strong>{order.delivery?.expectedDate}</strong>
              </p>
            </div>

            <div className="success-card">
              <h4><CreditCardIcon size={16} /> Payment</h4>
              <p className="success-address">{paymentLabel}</p>
            </div>
          </div>

          <div className="success-total-card">
            <div className="price-row"><span>Subtotal</span><span>{formatINRValue(order.subtotal)}</span></div>
            <div className="price-row"><span>Delivery Fee</span><span>{order.deliveryFee === 0 ? "FREE" : formatINRValue(order.deliveryFee)}</span></div>
            {order.discount > 0 && (
              <div className="price-row"><span>Discount</span><span>- {formatINRValue(order.discount)}</span></div>
            )}
            <div className="price-row"><span>Tax (GST 8%)</span><span>{formatINRValue(order.gst)}</span></div>
            <div className="price-divider"></div>
            <div className="price-row total"><span>Total Paid</span><span>{formatINRValue(order.total)}</span></div>
          </div>

          {order.notes && (
            <p className="success-note">
              <strong>Order note:</strong> {order.notes}
            </p>
          )}

          <div className="success-actions">
            <Link to="/menu" className="btn btn-primary">
              Continue Shopping
            </Link>
            <Link to="/profile" className="btn btn-outline">
              View Order History
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderSuccess;
