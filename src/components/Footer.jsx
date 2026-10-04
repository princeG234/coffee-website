import { Link } from "react-router-dom";
import { CoffeeIcon, InstagramIcon, FacebookIcon, TwitterIcon, YouTubeIcon } from "./Icons";
import { CAFE_INFO } from "../data/cafeInfo";

const Footer = () => {
  const year = 2026;
  const socials = [
    { href: "#", label: "Instagram", Icon: InstagramIcon },
    { href: "#", label: "Facebook", Icon: FacebookIcon },
    { href: "#", label: "Twitter", Icon: TwitterIcon },
    { href: "#", label: "YouTube", Icon: YouTubeIcon },
  ];

  return (
    <footer className="footer">
      {/* Top divider with coffee cup motif */}
      <div className="footer-divider">
        <span className="footer-divider-line"></span>
        <span className="footer-divider-cup">
          <CoffeeIcon size={22} />
        </span>
        <span className="footer-divider-line"></span>
      </div>

      <div className="footer-container">
        {/* Brand */}
        <div className="footer-section">
          <h3 className="footer-title">
            <CoffeeIcon size={28} /> Brew Bliss
          </h3>
          <p className="footer-desc">
            Crafting the perfect cup since 2015. Every sip tells a story of passion, quality, and love for coffee.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/menu">Menu</Link></li>
            <li><Link to="/bakery">Bakery</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Visit Us */}
        <div className="footer-section">
          <h4>Visit Us</h4>
          <ul className="footer-contact">
            <li>123 Coffee Street, Brewville</li>
            <li>(555) 123-4567</li>
            <li>hello@brewbliss.com</li>
          </ul>
        </div>

        {/* Hours */}
        <div className="footer-section">
          <h4>Hours</h4>
          <ul className="footer-hours">
            {CAFE_INFO.hours.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          <div className="footer-social">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                onClick={(e) => e.preventDefault()}
                aria-label={label}
              >
                <Icon size={22} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {year} Brew Bliss. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
