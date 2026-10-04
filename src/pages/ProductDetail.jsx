import { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { HeartIcon, ArrowRightIcon, CoffeeIcon } from "../components/Icons";
import { formatINR } from "../utils/format";
import { FALLBACK_ITEMS } from "../data/menuItems";
import ProductImage from "../components/ProductImage";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem, items } = useCart();
  const { user, favorites, addFavorite, removeFavorite } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch("/api/menu");
        const result = await res.json();
        if (result.success && result.data.length > 0) {
          const found = result.data.find((i) => i.id === parseInt(id));
          if (found) {
            setItem(found);
            setSelectedIngredients(found.ingredients || []);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("API fetch failed, using fallback data:", err.message);
      }
      const found = FALLBACK_ITEMS.find((i) => i.id === parseInt(id));
      if (found) {
        setItem(found);
        setSelectedIngredients(found.ingredients || []);
      }
      setLoading(false);
    };
    fetchItem();
  }, [id]);

  const isFavorite = item ? favorites.some((fav) => fav.id === item.id) : false;

  const handleToggleFavorite = () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (isFavorite) {
      removeFavorite(item.id);
    } else {
      addFavorite(item);
    }
  };

  const toggleIngredient = (ingredient) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((i) => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handleAddToCart = () => {
    const cartItem = {
      ...item,
      price:
        typeof item.price === "number"
          ? item.price
          : parseFloat(String(item.price).replace(/[^0-9.-]+/g, "")),
      ...(selectedIngredients.length === (item.ingredients || []).length ? {} : { selectedIngredients }),
      quantity,
    };
    addItem(cartItem);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const getCartQuantity = () => {
    return items
      .filter((i) => i.id === item?.id)
      .reduce((sum, i) => sum + i.quantity, 0);
  };

  if (loading) {
    return (
      <section className="product-detail-page section-padding bg-light">
        <div className="container product-detail-loading">
          <CoffeeIcon size={48} />
          <p>Loading product details...</p>
        </div>
      </section>
    );
  }

  if (!item) {
    return (
      <section className="product-detail-page section-padding bg-light">
        <div className="container product-detail-loading">
          <CoffeeIcon size={64} />
          <h2>Product Not Found</h2>
          <p>The item you're looking for doesn't exist or has been removed.</p>
          <Link to="/menu" className="btn btn-primary">Back to Menu</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="product-detail-page section-padding bg-light">
      <div className="container">
        <Link to="/menu" className="product-back-link">
          <ArrowRightIcon size={18} /> Back to Menu
        </Link>

        <div className="product-detail-layout">
          {/* Image Section */}
          <div className="product-image-section">
            <div className="product-main-image">
              <ProductImage
                src={item.image}
                alt={item.name}
                emoji={item.emoji}
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="product-info-section">
            <div className="product-category-badge">{item.category}</div>

            <h1 className="product-name">{item.name}</h1>
            <p className="product-desc">{item.desc}</p>

            <div className="product-price">{formatINR(item.price)}</div>

            {/* Quantity Selector */}
            <div className="product-quantity">
              <span className="product-quantity-label">Quantity:</span>
              <div className="product-quantity-controls">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="product-actions">
              <button
                className={`btn btn-primary product-add-btn ${addedToCart ? "added" : ""}`}
                onClick={handleAddToCart}
              >
                {addedToCart
                  ? "✓ Added to Cart"
                  : getCartQuantity() > 0
                  ? `Add to Cart (${getCartQuantity() + quantity})`
                  : "Add to Cart"}
              </button>

              <button
                className={`product-fav-btn ${isFavorite ? "active" : ""}`}
                onClick={handleToggleFavorite}
                title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              >
                <HeartIcon size={28} filled={isFavorite} />
              </button>
            </div>

            {/* Details */}
            <div className="product-details">
              <h3>Product Details</h3>
              <ul>
                <li><strong>Category:</strong> <span style={{ textTransform: "capitalize" }}>{item.category}</span></li>
              </ul>
            </div>

            {/* Customizable Ingredients */}
            <div className="product-ingredients">
              <h3>Customize Your Drink</h3>
              <p className="product-ingredients-hint">
                Tap ingredients to add or remove them from your drink
              </p>
              {item.ingredients && item.ingredients.length > 0 ? (
                <div className="product-ingredients-custom">
                  {item.ingredients.map((ing, idx) => {
                    const isSelected = selectedIngredients.includes(ing);
                    return (
                      <button
                        key={idx}
                        className={`ingredient-toggle ${isSelected ? "selected" : ""}`}
                        onClick={() => toggleIngredient(ing)}
                      >
                        <span className={`ingredient-toggle-check ${isSelected ? "selected" : ""}`}>
                          {isSelected ? "✓" : "+"}
                        </span>
                        <span className="ingredient-toggle-name">{ing}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="product-ingredients-empty">
                  Ingredient information not available for this item.
                </p>
              )}
              <div className="product-ingredients-summary">
                <span>{selectedIngredients.length} / {item.ingredients?.length || 0} ingredients selected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;
