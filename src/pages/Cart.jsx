import { Link, useNavigate } from "react-router-dom";
import { useCart, generateItemKey } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { TrashIcon, CartIcon } from "../components/Icons";
import { formatINR, usdToINR, formatINRValue } from "../utils/format";
import SectionHeader from "../components/SectionHeader";
import ProductImage from "../components/ProductImage";

const Cart = () => {
  const navigate = useNavigate();
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();

  const subtotalINR = Math.round(usdToINR(subtotal) * 100) / 100;
  const deliveryFee = 40; // Standard delivery to match Checkout
  const gst = Math.round(subtotalINR * 0.08 * 100) / 100;
  const estimatedTotal = Math.round((subtotalINR + deliveryFee + gst) * 100) / 100;
  const totalItemCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleCheckout = () => {
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <section className="cart-page section-padding bg-light">
        <div className="container">
          <SectionHeader
            subtitle="Your Cart"
            title="Your Cart is Empty"
            desc="Looks like you haven't added anything yet. Browse our menu and find your perfect brew!"
          />
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <CartIcon size={80} />
            </div>
            <p>No items in your cart</p>
            <Link to="/menu" className="btn btn-primary">
              Browse Menu
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-page section-padding bg-light">
      <div className="container">
        <SectionHeader
          subtitle="Your Cart"
          title="Review Your Order"
          desc="You're just a few clicks away from your perfect cup"
        />
        <div className="cart-wrapper">
          <div className="cart-items">
            {items.map((item) => (
              <div
                key={item.itemKey || item.id}
                className="cart-item"
              >
                <div className="cart-item-image">
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    emoji={item.emoji}
                  />
                </div>
                <div className="cart-item-info">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <p className="cart-item-desc">{item.desc}</p>
                  {item.selectedIngredients && item.selectedIngredients.length > 0 && (
                    <div className="cart-item-ingredients">
                      {item.selectedIngredients.map((ing, idx) => (
                        <span key={idx} className="cart-item-ingredient">
                          {ing}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="cart-item-price">{formatINR(item.price * item.quantity)}</span>
                </div>
                <div className="cart-item-actions">
                  <div className="cart-quantity">
                    <button className="qty-btn" onClick={() => updateQuantity(generateItemKey(item), item.quantity - 1)}>-</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(generateItemKey(item), item.quantity + 1)}>+</button>
                  </div>
                  <button className="cart-remove-btn" onClick={() => removeItem(generateItemKey(item))}>
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            ))}
            <button className="cart-clear-btn" onClick={clearCart}>
              Clear Cart
            </button>
          </div>

          <div className="cart-summary">
            <h3 className="summary-title">Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal ({totalItemCount} {totalItemCount === 1 ? "item" : "items"})</span>
              <span>{formatINRValue(subtotalINR)}</span>
            </div>
            <div className="summary-row">
              <span>Estimated Delivery</span>
              <span>{formatINRValue(deliveryFee)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (GST 8%)</span>
              <span>{formatINRValue(gst)}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row summary-total">
              <span>Estimated Total</span>
              <span>{formatINRValue(estimatedTotal)}</span>
            </div>
            <p className="cart-delivery-note">
              * Delivery estimated for Standard Delivery (₹40.00). Free with FREESHIP coupon at checkout.
            </p>
            <button className="btn btn-primary checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
            <Link to="/menu" className="continue-shopping">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cart;
