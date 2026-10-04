import { Link } from "react-router-dom";
import { Coffee, Star, ArrowRight, Croissant, Quote } from "lucide-react";
import { formatINRValue } from "../utils/format";
import ProductImage from "../components/ProductImage";

const featuredProducts = [
  {
    id: 1,
    name: "Classic Espresso",
    desc: "Double shot of our signature blend",
    price: 290.5,
    inr: true,
    image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=300&fit=crop",
    emoji: "☕",
  },
  {
    id: 4,
    name: "Cold Brew",
    desc: "24-hour steeped, ultra-smooth",
    price: 415.0,
    inr: true,
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=300&fit=crop",
    emoji: "🧊",
  },
  {
    id: 7,
    name: "Caramel Macchiato",
    desc: "Vanilla and caramel layered latte",
    price: 498.0,
    inr: true,
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=300&fit=crop",
    emoji: "🍯",
  },
];

const bakeryProducts = [
  {
    id: 12,
    name: "Croissant",
    desc: "Buttery, flaky perfection",
    price: 290.5,
    inr: true,
    image: "https://images.unsplash.com/photo-1623334044303-241021148842?w=400&h=300&fit=crop",
    emoji: "🥐",
  },
  {
    id: 17,
    name: "Fudgy Brownie",
    desc: "Rich, dense, and extra chocolatey",
    price: 290.5,
    inr: true,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop",
    emoji: "🍫",
  },
  {
    id: 23,
    name: "Classic Baguette",
    desc: "Crusty French baguette, baked daily",
    price: 415.0,
    inr: true,
    image: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400&h=300&fit=crop",
    emoji: "🥖",
  },
];

const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    text: "Best coffee in town! The atmosphere is incredible and the baristas really know their craft.",
    rating: 5,
  },
  {
    id: 2,
    name: "James K.",
    text: "I have been coming here for years. The cold brew is absolutely unmatched anywhere else.",
    rating: 5,
  },
  {
    id: 3,
    name: "Emily R.",
    text: "Perfect place to work or relax. Amazing pastries to go with your coffee too!",
    rating: 5,
  },
];

const renderStars = (count) => {
  const s = [];
  for (let i = 0; i < count; i++) s.push(<Star key={i} size={16} className="fill-gold text-gold" />);
  return s;
};

const PillTag = ({ children }) => (
  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 text-gold text-xs font-bold tracking-[0.18em] uppercase">
    {children}
  </span>
);

const ProductCard = ({ item, to }) => (
  <div className="bg-surface rounded-2xl border border-border p-5 shadow-soft hover:shadow-hover hover:-translate-y-1.5 transition-all duration-300 flex flex-col gap-4">
    <div className="overflow-hidden rounded-xl">
      <ProductImage
        src={item.image}
        alt={item.name}
        emoji={item.emoji}
        className="w-full h-60 object-cover hover:scale-105 transition-transform duration-500"
      />
    </div>
    <h3 className="font-serif text-xl text-inktone">{item.name}</h3>
    <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
    <div className="mt-auto flex items-center justify-between">
      <span className="text-lg font-bold text-gold">{formatINRValue(item.price)}</span>
      <Link
        to={to}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gold/10 text-gold text-sm font-semibold hover:bg-gold hover:text-choco transition-all duration-200"
      >
        Order Now <ArrowRight size={16} />
      </Link>
    </div>
  </div>
);

const Home = () => {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-espresso-dark pt-32 lg:pt-40 pb-16 lg:pb-24">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gold/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 text-gold text-sm font-semibold">
              <Coffee size={16} /> Premium Coffee Since 2015
            </span>
            <h1 className="mt-6 font-serif text-5xl sm:text-6xl lg:text-7xl leading-none text-offwhite">
              Wake Up to <br />
              <span className="text-gold">Perfect Bliss</span>
            </h1>
            <p className="mt-6 text-offwhite/70 text-lg max-w-xl mx-auto lg:mx-0">
              Experience the art of coffee making. Every cup is crafted with love, using the finest beans from around the world.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link
                to="/menu"
                className="px-7 py-3.5 rounded-full bg-gold text-espresso-dark font-semibold hover:bg-gold/90 hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-gold/25"
              >
                Explore Our Menu
              </Link>
              <Link
                to="/about"
                className="px-7 py-3.5 rounded-full border border-gold/50 text-offwhite font-semibold hover:bg-gold/10 transition-all duration-200"
              >
                Our Story
              </Link>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="rounded-full overflow-hidden border-8 border-gold/25 shadow-hover">
              <img
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop"
                alt="Freshly brewed coffee"
                className="w-full aspect-square object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Bestsellers */}
      <section className="bg-cream py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <PillTag>Discover</PillTag>
            <h2 className="mt-5 font-serif text-4xl sm:text-5xl text-inktone">Our Bestsellers</h2>
            <p className="mt-4 text-muted text-lg">Handpicked favorites that our customers love</p>
            <div className="mt-6 mx-auto w-24 h-0.5 bg-gold/60" />
          </div>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((item) => (
              <ProductCard key={item.id} item={item} to="/menu" />
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Bakery Corner */}
      <section className="bg-surface py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <PillTag>
              <Croissant size={14} /> Fresh from the Oven
            </PillTag>
            <h2 className="mt-5 font-serif text-4xl sm:text-5xl text-inktone">The Bakery Corner</h2>
            <p className="mt-4 text-muted text-lg">
              Handcrafted breads, pastries, and desserts baked fresh every morning
            </p>
            <div className="mt-6 mx-auto w-24 h-0.5 bg-gold/60" />
          </div>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bakeryProducts.map((item) => (
              <ProductCard key={item.id} item={item} to="/bakery" />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              to="/bakery"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-espresso text-offwhite font-semibold hover:bg-espresso-light hover:-translate-y-0.5 transition-all duration-200 shadow-lg"
            >
              Explore the Bakery <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 3: Customer Reviews */}
      <section className="bg-cream py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <PillTag>Reviews</PillTag>
            <h2 className="mt-5 font-serif text-4xl sm:text-5xl text-inktone">What Our Customers Say</h2>
            <div className="mt-6 mx-auto w-24 h-0.5 bg-gold/60" />
          </div>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-surface rounded-2xl border border-border p-8 shadow-soft hover:shadow-hover hover:-translate-y-1.5 transition-all duration-300 flex flex-col gap-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">{renderStars(t.rating)}</div>
                  <Quote className="text-gold/30" size={28} />
                </div>
                <p className="text-inktone/80 italic leading-relaxed">"{t.text}"</p>
                <div className="mt-auto flex items-center gap-3 pt-2">
                  <span className="w-11 h-11 rounded-full bg-gold/20 text-gold grid place-items-center font-bold">
                    {t.name.charAt(0)}
                  </span>
                  <span className="font-serif font-semibold text-inktone">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: CTA Banner */}
      <section className="bg-espresso py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-4xl sm:text-5xl text-offwhite">Ready for the Perfect Cup?</h2>
          <p className="mt-4 text-offwhite/70 text-lg">Visit us today or order online for pickup</p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link
              to="/menu"
              className="px-7 py-3.5 rounded-full bg-gold text-espresso-dark font-semibold hover:bg-gold/90 hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-gold/25"
            >
              View Full Menu
            </Link>
            <Link
              to="/contact"
              className="px-7 py-3.5 rounded-full border border-offwhite/40 text-offwhite font-semibold hover:bg-offwhite/10 transition-all duration-200"
            >
              Find Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
