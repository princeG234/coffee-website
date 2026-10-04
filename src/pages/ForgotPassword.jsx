import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CoffeeIcon, EmailIcon } from "../components/Icons";
import { useAuth } from "../context/AuthContext";

const ForgotPassword = () => {
  const { isEmailRegistered, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = email, 2 = OTP verify, 3 = new password, 4 = done
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState(null);
  const [isRealEmail, setIsRealEmail] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!isEmailRegistered(email.trim())) {
      setErrors({ email: "No account found with this email address" });
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }
      if (data.demoOtp) {
        setDemoOtp(data.demoOtp);
      }
      setIsRealEmail(Boolean(data.isRealEmailSent));
      if (data.isRealEmailSent) {
        setInfo(
          "We've sent a 6-digit OTP to " + email.trim() + ". Please check your inbox and enter the code below."
        );
      } else {
        setInfo(
          "Your 6-digit verification OTP has been generated! Use the code below to reset your password."
        );
      }
      setStep(2);
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!otp.trim()) {
      newErrors.otp = "Please enter the OTP";
    } else if (!/^\d{6}$/.test(otp.trim())) {
      newErrors.otp = "OTP must be 6 digits";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "OTP verification failed");
      }
      setInfo("");
      setErrors({});
      setStep(3);
    } catch (err) {
      setErrors({ otp: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!password) {
      newErrors.password = "New password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      resetPassword(email.trim(), password);
      setInfo("Your password has been reset successfully. Please sign in with your new password.");
      setStep(4);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setErrors({ form: err.message });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "otp") setOtp(value.replace(/\D/g, "").slice(0, 6));
    if (name === "password") setPassword(value);
    if (name === "confirmPassword") setConfirmPassword(value);
    setErrors((prev) => ({ ...prev, [name]: "", form: "" }));
  };

  const getSubtitle = () => {
    if (step === 1) return "Enter your account email to get started";
    if (step === 2) return "Enter the OTP sent to your email";
    if (step === 3) return "Set a new password for " + email;
    return "Password reset complete";
  };

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
              <h2 className="auth-title">Reset Password</h2>
              <p className="auth-subtitle">{getSubtitle()}</p>
            </div>

            {info && (
              <div className="auth-info auth-info-success">
                {info}
              </div>
            )}

            {step === 1 && (
              <form className="auth-form" onSubmit={handleEmailSubmit} noValidate>
                <div className="auth-field">
                  <label htmlFor="email">Email Address</label>
                  <div className={`auth-input-wrapper ${errors.email ? "error" : ""}`}>
                    <EmailIcon size={18} className="auth-field-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.email && <span className="auth-error">{errors.email}</span>}
                </div>

                {errors.form && <div className="auth-error">{errors.form}</div>}

                <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form className="auth-form" onSubmit={handleOtpSubmit} noValidate>
                {demoOtp && (
                  <div
                    style={{
                      background: "#fffbeb",
                      border: "1.5px dashed #d97706",
                      borderRadius: "12px",
                      padding: "16px",
                      marginBottom: "20px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#92400e", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        ⚡ Real-Time Generated OTP
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setOtp(demoOtp);
                          setErrors((prev) => ({ ...prev, otp: "" }));
                        }}
                        style={{
                          background: "#b45309",
                          color: "#fff",
                          border: "none",
                          padding: "5px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Auto-Fill OTP
                      </button>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                      <span style={{ fontSize: "14px", color: "#78350f" }}>Verification Code:</span>
                      <strong style={{ fontSize: "24px", letterSpacing: "4px", color: "#451a03", fontFamily: "monospace" }}>
                        {demoOtp}
                      </strong>
                    </div>
                    {!isRealEmail && (
                      <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#92400e", lineHeight: "1.4" }}>
                        * Local development mode. To deliver real emails to your Gmail inbox, add your Gmail App Password to <code>backend/.env</code>.
                      </p>
                    )}
                  </div>
                )}

                <div className="auth-field">
                  <label htmlFor="otp">Enter OTP</label>
                  <div className={`auth-input-wrapper ${errors.otp ? "error" : ""}`}>
                    <span className="auth-password-icon">🔑</span>
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      inputMode="numeric"
                      placeholder="6-digit OTP"
                      value={otp}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.otp && <span className="auth-error">{errors.otp}</span>}
                </div>

                {errors.form && <div className="auth-error">{errors.form}</div>}

                <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  className="auth-back-link"
                  onClick={() => setStep(1)}
                >
                  ← Change email
                </button>
              </form>
            )}

            {step === 3 && (
              <form className="auth-form" onSubmit={handlePasswordSubmit} noValidate>
                <div className="auth-field">
                  <label htmlFor="password">New Password</label>
                  <div className={`auth-input-wrapper ${errors.password ? "error" : ""}`}>
                    <span className="auth-password-icon">🔒</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="Create a new password"
                      value={password}
                      onChange={handleChange}
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
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div className={`auth-input-wrapper ${errors.confirmPassword ? "error" : ""}`}>
                    <span className="auth-password-icon">🔒</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <span className="auth-error">{errors.confirmPassword}</span>
                  )}
                </div>

                {errors.form && <div className="auth-error">{errors.form}</div>}

                <button type="submit" className="btn btn-primary auth-submit">
                  Reset Password
                </button>
              </form>
            )}

            {step < 4 && (
              <p className="auth-footer-text">
                Remembered it? <Link to="/login" className="auth-link">Back to Sign In</Link>
              </p>
            )}
          </div>

          <div className="auth-hero">
            <div className="auth-hero-rotate"></div>
            <div className="auth-hero-content">
              <div className="auth-hero-icon">
                <CoffeeIcon size={80} />
              </div>
              <h2>No worries, we've got you</h2>
              <p>
                We'll send a one-time password to your email. Verify it, then set your new password and get back to enjoying your favorite coffee.
              </p>
              <ul className="auth-benefits">
                <li>✉️ OTP sent securely to your email</li>
                <li>🔒 Password change only after verification</li>
                <li>☕ Back to your coffee in no time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
