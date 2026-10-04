import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CoffeeIcon, EmailIcon } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Register = () => {
  const { register, user } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      const from = location.state?.from || (totalItems > 0 ? "/cart" : "/profile");
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state, totalItems]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!agree) {
      newErrors.agree = "Please accept the Terms & Privacy Policy";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      register(formData.name, formData.email, formData.password);
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
              <h2 className="auth-title">Create Account</h2>
              <p className="auth-subtitle">Join Brew Bliss and start your coffee journey</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate autoComplete="off">
              <div className="auth-field">
                <label htmlFor="name">Full Name</label>
                <div className={`auth-input-wrapper ${errors.name ? "error" : ""}`}>
                  <span className="auth-password-icon">👤</span>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>
                {errors.name && <span className="auth-error">{errors.name}</span>}
              </div>

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
                    placeholder="Create a password"
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

              <div className="auth-field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className={`auth-input-wrapper ${errors.confirmPassword ? "error" : ""}`}>
                  <span className="auth-password-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirmPassword && (
                  <span className="auth-error">{errors.confirmPassword}</span>
                )}
              </div>

              <div className="auth-options">
                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                  />
                  <span>I agree to the Terms & Privacy Policy</span>
                </label>
                {errors.agree && <span className="auth-error">{errors.agree}</span>}
              </div>

              {errors.form && <div className="auth-error">{errors.form}</div>}

              <button type="submit" className="btn btn-primary auth-submit">
                Create Account
              </button>
            </form>

            <p className="auth-footer-text">
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Sign In
              </Link>
            </p>
          </div>

          <div className="auth-hero">
            <div className="auth-hero-rotate"></div>
            <div className="auth-hero-content">
              <div className="auth-hero-icon">
                <CoffeeIcon size={80} />
              </div>
              <h2>Join the Brew Bliss Family</h2>
              <p>
                Create an account to enjoy exclusive perks, track your orders, and get rewarded for every cup.
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

export default Register;
