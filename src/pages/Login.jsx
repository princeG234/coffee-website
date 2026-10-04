import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CoffeeIcon, EmailIcon } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Login = () => {
  const { login, user } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      const from = location.state?.from || (totalItems > 0 ? "/cart" : "/profile");
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state, totalItems]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      login(formData.email, formData.password);
      const from = location.state?.from || (totalItems > 0 ? "/cart" : "/profile");
      navigate(from, { replace: true });
    } catch (err) {
      setErrors({ form: err.message });
    }
  };

  if (user) {
    return null;
  }

  return (
    <section className="auth-page section-padding bg-light">
      <div className="container">
        <div className="auth-wrapper">
          <div className="auth-card">
            <div className="auth-header">
              <Link to="/" className="auth-logo">
                <CoffeeIcon size={32} />
                <span>Brew Bliss</span>
              </Link>
              <h2 className="auth-title">Welcome Back</h2>
              <p className="auth-subtitle">Sign in to your account to continue</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate autoComplete="off">
              <div className="auth-field">
                <label htmlFor="email">Email Address</label>
                <div className={`auth-input-wrapper ${errors.email ? "error" : ""}`}>
                  <EmailIcon size={18} className="auth-field-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>
                {errors.email && <span className="auth-error">{errors.email}</span>}
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <div className={`auth-input-wrapper ${errors.password ? "error" : ""}`}>
                  <span className="auth-password-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.password && <span className="auth-error">{errors.password}</span>}
              </div>

              <div className="auth-options" style={{ justifyContent: "flex-end" }}>
                <Link to="/forgot-password" className="auth-forgot">
                  Forgot Password?
                </Link>
              </div>

              {errors.form && <div className="auth-error">{errors.form}</div>}

              <button type="submit" className="btn btn-primary auth-submit">
                Sign In
              </button>
            </form>

            <p className="auth-footer-text">
              Don't have an account? <Link to="/register" className="auth-link">Sign Up</Link>
            </p>
          </div>

          <div className="auth-hero">
            <div className="auth-hero-rotate"></div>
            <div className="auth-hero-content">
              <div className="auth-hero-icon">
                <CoffeeIcon size={80} />
              </div>
              <h2>Start Your Day with Brew Bliss</h2>
              <p>
                Join our community of coffee lovers and enjoy exclusive perks, rewards, and a personalized coffee experience.
              </p>
              <ul className="auth-benefits">
                <li>✨ Exclusive member discounts</li>
                <li>🎁 Birthday rewards</li>
                <li>☕ Free coffee after 10 purchases</li>
                <li>📱 Early access to new flavors</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
