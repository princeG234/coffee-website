import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Coffee, ShoppingBag, User, LogIn, LogOut, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems, clearCart } = useCart();
  const { user, logout } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    clearCart();
    logout();
    closeMenu();
    window.location.href = "/";
  };

  const navLinks = [
    { to: "/", label: "Home", end: true },
    { to: "/menu", label: "Menu" },
    { to: "/bakery", label: "Bakery" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "text-gold bg-gold/10"
        : "text-espresso/80 hover:text-gold hover:bg-gold/5"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-full text-sm font-medium transition-colors ${
      isActive ? "text-gold bg-gold/10" : "text-espresso/80 hover:text-gold hover:bg-gold/5"
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream/90 backdrop-blur-md border-b border-espresso/10 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" onClick={closeMenu} className="flex items-center gap-2.5 shrink-0">
            <span className="w-10 h-10 rounded-full bg-gold text-surface grid place-items-center shadow-md shadow-gold/30">
              <Coffee size={22} strokeWidth={1.8} />
            </span>
            <span className="font-serif text-xl font-bold tracking-tight text-espresso">
              Brew <span className="text-gold">Bliss</span>
            </span>
          </Link>

          {/* Desktop center nav */}
          <div className=" hidden lg:flex items-center gap-1 bg-white/60 border border-espresso/10 rounded-full p-1 backdrop-blur-sm">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} onClick={closeMenu} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop right actions */}
          <div className=" hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <NavLink
                  to="/profile"
                  onClick={closeMenu}
                  className="flex items-center gap-1.5 text-sm font-medium text-espresso/80 hover:text-gold transition-colors px-2"
                >
                  <User size={18} />
                  <span>{user.name}</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium text-espresso/80 hover:text-gold transition-colors px-2"
                >
                  <LogOut size={17} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={closeMenu}
                  className="flex items-center gap-1.5 text-sm font-medium text-espresso/80 hover:text-gold transition-colors px-2"
                >
                  <LogIn size={17} />
                  <span>Sign In</span>
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={closeMenu}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold bg-espresso text-cream hover:bg-espresso-light hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-espresso/20"
                >
                  Sign Up
                </NavLink>
              </>
            )}

            <NavLink
              to="/cart"
              onClick={closeMenu}
              className="relative flex items-center gap-1.5 px-3 py-2.5 rounded-full text-sm font-medium text-espresso/80 hover:text-gold hover:bg-gold/5 transition-colors"
            >
              <span className="relative">
                <ShoppingBag size={20} />
                <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-surface text-[11px] font-bold grid place-items-center">
                  {totalItems}
                </span>
              </span>
              <span>Cart</span>
            </NavLink>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={toggleMenu}
            aria-label="Toggle navigation"
            className="lg:hidden w-11 h-11 grid place-items-center rounded-full text-espresso bg-white/60 border border-espresso/10"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[26rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="px-4 pb-5 pt-2 bg-cream flex flex-col gap-1.5">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} onClick={closeMenu} className={mobileLinkClass}>
              {link.label}
            </NavLink>
          ))}

          <div className="h-px bg-espresso/10 my-2" />

          {user ? (
            <>
              <NavLink to="/profile" onClick={closeMenu} className={mobileLinkClass}>
                <span className="flex items-center gap-2">
                  <User size={18} /> {user.name}
                </span>
              </NavLink>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-3 rounded-full text-sm text-espresso/80 hover:text-gold">
                <LogOut size={17} /> Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={closeMenu} className={mobileLinkClass}>
                <span className="flex items-center gap-2">
                  <LogIn size={17} /> Sign In
                </span>
              </NavLink>
              <NavLink
                to="/register"
                onClick={closeMenu}
                className="px-4 py-3 rounded-full text-center text-sm font-semibold bg-espresso text-cream hover:bg-espresso-light transition-all"
              >
                Sign Up
              </NavLink>
            </>
          )}

          <NavLink to="/cart" onClick={closeMenu} className={mobileLinkClass}>
            <span className="flex items-center gap-2">
              <ShoppingBag size={18} /> Cart
              {totalItems > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-surface text-[11px] font-bold grid place-items-center">
                  {totalItems}
                </span>
              )}
            </span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
