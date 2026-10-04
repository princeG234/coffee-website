import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { BakeryIcon, HeartIcon, ArrowRightIcon } from "../components/Icons";
import { formatINR } from "../utils/format";
import { FALLBACK_ITEMS } from "../data/menuItems";
import SectionHeader from "../components/SectionHeader";
import Button from "../components/Button";
import ProductImage from "../components/ProductImage";

const categories = [
  { id: "all", label: "All" },
  { id: "pastry", label: "Pastries" },
  { id: "bakery", label: "Bakery & Desserts" },
];

const Bakery = () => {
  const [items, setItems] = useState(
    FALLBACK_ITEMS.filter((item) => item.category === "bakery" || item.category === "pastry")
  );
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [addedItems, setAddedItems] = useState({});
  const { addItem, items: cartItems } = useCart();
  const { user, favorites, addFavorite, removeFavorite } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchBakery = async () => {
      try {
        const res = await fetch("/api/menu");
        const result = await res.json();
        if (result.success && result.data.length > 0) {
          const baked = result.data.filter(
            (item) => item.category === "bakery" || item.category === "pastry"
          );
          if (baked.length > 0) setItems(baked);
        }
      } catch (err) {
        console.warn("API fetch failed, using fallback data:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBakery();
  }, []);

  const filtered =
    activeCategory === "all"
      ? items
      : items.filter((item) => item.category === activeCategory);

  const handleAddToCart = (item) => {
    addItem({
      ...item,
      price:
        typeof item.price === "number"
          ? item.price
          : parseFloat(String(item.price).replace(/[^0-9.-]+/g, "")),
    });
    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  const getItemQuantity = (id) => {
    const cartItem = cartItems.find((item) => item.id === id);
    return cartItem ? cartItem.quantity : 0;
  };

  const isFavorite = (id) => favorites.some((fav) => fav.id === id);

  const handleToggleFavorite = (item) => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (isFavorite(item.id)) {
      removeFavorite(item.id);
    } else {
      addFavorite(item);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="bakery-hero">
        <span className="bakery-hero-emoji">🥐</span>
        <div className="bakery-hero-pattern"></div>
        <div className="bakery-hero-content">
          <div className="bakery-hero-badge">
            <BakeryIcon size={20} /> Fresh from the Oven
          </div>
          <h1 className="bakery-hero-title">
            The Art of <span className="hero-highlight">Baking</span>
          </h1>
          <p className="bakery-hero-desc">
            Handcrafted breads, flaky pastries, and indulgent desserts — baked fresh every morning with the finest ingredients.
          </p>
          <div className="bakery-hero-actions">
            <Button to="/menu">Full Menu</Button>
            <Button to="/contact" variant="secondary">Find Us</Button>
          </div>
        </div>
      </section>

      {/* Bakery page */}
      <section className="bakery-page section-padding bg-light">
        <div className="container">
          <SectionHeader
            subtitle="Bakery & Pastries"
            title="Baked With Love, Every Day"
            desc="From crusty sourdough to melt-in-your-mouth macarons, there's something for every craving."
          />

          <div className="bakery-filters">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`bakery-filter-btn ${activeCategory === cat.id ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="bakery-empty">
              <p>Loading our bakery...</p>
            </div>
          ) : (
            <div className="bakery-grid">
              {filtered.map((item) => (
                <div key={item.id} className="bakery-card">
                  <div className="bakery-card-image">
                    <Link to={`/menu/${item.id}`} className="bakery-card-image-link">
                      <ProductImage
                        src={item.image}
                        alt={item.name}
                        emoji={item.emoji}
                      />
                    </Link>
                    <button
                      className={`bakery-fav-btn ${isFavorite(item.id) ? "active" : ""}`}
                      onClick={() => handleToggleFavorite(item)}
                      title={isFavorite(item.id) ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      <HeartIcon size={20} filled={isFavorite(item.id)} />
                    </button>
                  </div>
                  <div className="bakery-card-info">
                    <Link to={`/menu/${item.id}`}>
                      <h3 className="bakery-card-name">{item.name}</h3>
                    </Link>
                    <p className="bakery-card-desc">{item.desc}</p>
                  </div>
                  <div className="bakery-card-footer">
                    <span className="bakery-card-price">{formatINR(item.price)}</span>
                    <button
                      className={`bakery-card-btn ${addedItems[item.id] ? "added" : ""}`}
                      onClick={() => handleAddToCart(item)}
                    >
                      {addedItems[item.id]
                        ? "✓ Added"
                        : getItemQuantity(item.id) > 0
                        ? `Add + (${getItemQuantity(item.id)})`
                        : "Add +"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="bakery-empty">
              <p>No items in this category yet. Coming soon!</p>
            </div>
          )}

          <div className="bakery-cta">
            <h3>Can't decide?</h3>
            <p>
              Grab a mix of our most-loved treats and enjoy them with your favorite Brew Bliss coffee.
            </p>
            <Button to="/menu">
              Browse Everything <ArrowRightIcon size={16} />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Bakery;
