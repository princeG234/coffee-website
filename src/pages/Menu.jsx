import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Heart, Plus, Coffee, Croissant, CupSoda, Sparkles } from "lucide-react";
import { formatINR } from "../utils/format";
import { FALLBACK_ITEMS } from "../data/menuItems";
import ProductImage from "../components/ProductImage";

const categories = [
  { id: "all", label: "All" },
  { id: "espresso", label: "Espresso" },
  { id: "cold", label: "Cold Brew" },
  { id: "specialty", label: "Specialty" },
  { id: "pastry", label: "Pastries" },
  { id: "bakery", label: "Bakery" },
];

const PillTag = ({ children }) => (
  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 text-gold text-xs font-bold tracking-[0.18em] uppercase">
    {children}
  </span>
);

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [addedItems, setAddedItems] = useState({});
  const { addItem, items } = useCart();
  const { user, favorites, addFavorite, removeFavorite } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const filtered =
    activeCategory === "all"
      ? FALLBACK_ITEMS
      : FALLBACK_ITEMS.filter((item) => item.category === activeCategory);

  const handleAddToCart = (item) => {
    addItem({ ...item, price: Number(item.price) });
    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  const getItemQuantity = (id) => {
    const cartItem = items.find((item) => item.id === id);
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

  const categoryIcon = (id) => {
    if (id === "espresso") return <Coffee size={13} />;
    if (id === "cold") return <CupSoda size={13} />;
    if (id === "specialty") return <Sparkles size={13} />;
    if (id === "pastry" || id === "bakery") return <Croissant size={13} />;
    return null;
  };

  return (
    <section className="bg-offwhite min-h-screen pt-28 lg:pt-36 pb-20 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <PillTag>Our Menu</PillTag>
          <h1 className="mt-5 font-serif text-4xl sm:text-5xl text-inktone">Crafted for Every Mood</h1>
          <p className="mt-4 text-muted text-lg">
            From bold espressos to soothing lattes, find your perfect cup
          </p>
          <div className="mt-6 mx-auto w-24 h-0.5 bg-gold/60" />
        </div>

<div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-espresso text-cream shadow-lg shadow-espresso/25"
                  : "bg-white text-espresso border border-espresso/10 hover:border-gold/60 hover:text-gold hover:shadow-md"
              }`}
            >
              {categoryIcon(cat.id)}
              {cat.label}
            </button>
          ))}
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-surface rounded-2xl border border-espresso/10 p-5 shadow-soft hover:shadow-hover hover:-translate-y-1.5 transition-all duration-300 flex flex-col gap-4"
            >
              <div className="relative overflow-hidden rounded-xl">
                <Link to={`/menu/${item.id}`} className="block">
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    emoji={item.emoji}
                    className="w-full h-56 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <button
                  onClick={() => handleToggleFavorite(item)}
                  title={isFavorite(item.id) ? "Remove from Favorites" : "Add to Favorites"}
                  className={`absolute top-3 right-3 w-10 h-10 grid place-items-center rounded-full transition-all duration-200 ${
                    isFavorite(item.id)
                      ? "bg-gold text-surface"
                      : "bg-white/90 text-muted hover:text-gold shadow-md"
                  }`}
                >
                  <Heart size={18} fill={isFavorite(item.id) ? "currentColor" : "none"} />
                </button>
              </div>

              <div>
                <Link to={`/menu/${item.id}`} className="w-fit">
                  <h3 className="font-serif text-xl text-inktone">{item.name}</h3>
                </Link>
                <p className="mt-1 text-muted text-sm leading-relaxed">{item.desc}</p>
              </div>

              <div className="mt-auto flex items-center justify-between">
                <span className="text-lg font-bold text-gold">{formatINR(item.price)}</span>
                <button
                  onClick={() => handleAddToCart(item)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    addedItems[item.id]
                      ? "bg-success text-white"
                      : "bg-espresso text-cream hover:bg-espresso-light hover:-translate-y-0.5 shadow-md shadow-espresso/25"
                  }`}
                >
                  {addedItems[item.id] ? (
                    "✓ Added"
                  ) : getItemQuantity(item.id) > 0 ? (
                    `Add + (${getItemQuantity(item.id)})`
                  ) : (
                    <>
                      <Plus size={16} /> Add
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-12 grid place-items-center py-20 text-muted bg-surface border border-espresso/10 rounded-2xl">
            <p>No items in this category yet. Coming soon!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Menu;
