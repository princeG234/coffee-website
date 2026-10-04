import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CoffeeIcon, LocationIcon, PhoneIcon, EmailIcon, ClockIcon, StarIcon, HeartIcon, TrashIcon, LogOutIcon, CheckIcon, CameraIcon, BagIcon, TruckIcon, ArrowRightIcon, WarningIcon, EditIcon } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatINR, formatINRValue } from "../utils/format";
import SectionHeader from "../components/SectionHeader";
import ProductImage from "../components/ProductImage";
import { FALLBACK_ITEMS } from "../data/menuItems";

const Profile = () => {
  const { user, orderHistory, favorites, removeFavorite, logout, deleteAccount, updateProfile } = useAuth();
  const { addItem, clearCart } = useCart();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", location: "" });
  const timesOrdered = (name) => orderHistory.filter((o) => o.items?.includes(name)).length;
  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "U";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const getCanonicalPrice = (item) => {
    const canonical = FALLBACK_ITEMS.find((f) => f.id === item.id);
    if (canonical) return canonical.price;
    const n = typeof item.price === "number" ? item.price : parseFloat(String(item.price).replace(/[^0-9.-]+/g, ""));
    if (n >= 30) return Math.round((n / 83) * 100) / 100;
    return n;
  };
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [photoMsg, setPhotoMsg] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleLogout = () => {
    clearCart();
    logout();
    // Full reload so the site restarts in a clean guest state
    window.location.href = "/";
  };

  const handleAddFavoriteToCart = (item) => {
    const price = getCanonicalPrice(item);
    addItem({
      ...item,
      price,
    });
    navigate("/cart");
  };

  const handleDeleteAccount = () => {
    deleteAccount();
    navigate("/register");
  };

  const resizeImage = (file, maxSize = 200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoMsg("Please select an image file (JPG, PNG, GIF)");
      setTimeout(() => setPhotoMsg(""), 4000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoMsg("Image is too large. Please choose one under 5MB.");
      setTimeout(() => setPhotoMsg(""), 4000);
      return;
    }

    try {
      const resizedDataUrl = await resizeImage(file);
      updateProfile({ avatar: resizedDataUrl });
      setPhotoMsg("Profile picture updated successfully!");
      setTimeout(() => setPhotoMsg(""), 4000);
    } catch {
      setPhotoMsg("Failed to upload image. Please try again.");
      setTimeout(() => setPhotoMsg(""), 4000);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isAvatarImage = user && user.avatar && user.avatar.startsWith("data:");

  const startEditing = () => {
    setFormData({ name: user.name, phone: user.phone || "", location: user.location || "" });
    setErrors({});
    setSuccessMsg("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setErrors({});
    setSuccessMsg("");
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.phone.trim()) newErrors.phone = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ""))) newErrors.phone = "Enter a valid 10-digit Indian mobile number";
    if (!formData.location.trim()) newErrors.location = "Address is required";
    return newErrors;
  };

  const handleSave = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    updateProfile({ name: formData.name.trim(), phone: formData.phone.trim(), location: formData.location.trim() });
    setIsEditing(false);
    setSuccessMsg("Your profile has been updated successfully!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  if (!user) {
    return (
      <section className="profile-page section-padding bg-light">
        <div className="container">
          <SectionHeader subtitle="My Account" title="Customer Profile" desc="Sign in to view your profile and order history" />
          <div className="profile-login-prompt">
            <div className="profile-login-icon">
              <CoffeeIcon size={64} />
            </div>
            <h3>You are not signed in</h3>
            <p>Please sign in or create an account to view your profile, order history, and favorites.</p>
            <div className="profile-login-actions">
              <Link to="/login" className="btn btn-primary">Sign In</Link>
              <Link to="/register" className="btn btn-outline">Create Account</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const customer = user;

  const getStatusClass = (status) => {
    switch (status) {
      case "Delivered": return "delivered";
      case "Processing": return "processing";
      case "Cancelled": return "cancelled";
      default: return "default";
    }
  };

  const popularItems = [
    { id: 7, name: "Caramel Macchiato", desc: "Vanilla and caramel layered latte", price: 6.00, emoji: "🍮" },
    { id: 4, name: "Cold Brew", desc: "24-hour steeped, ultra-smooth", price: 5.00, emoji: "🧊" },
    { id: 12, name: "Croissant", desc: "Buttery, flaky perfection", price: 3.50, emoji: "🥐" },
  ];

  const trackerSteps = [
    { label: "Order Placed", icon: <BagIcon size={14} /> },
    { label: "Preparing", icon: <CoffeeIcon size={14} /> },
    { label: "On the Way", icon: <TruckIcon size={14} /> },
    { label: "Delivered", icon: <CheckIcon size={14} /> },
  ];

  const getStatusIndex = (status) => {
    switch (status) {
      case "Delivered": return 3;
      case "Processing": return 1;
      case "Placed": return 0;
      case "On the Way": return 2;
      case "Cancelled": return -1;
      default: return 0;
    }
  };

  return (
    <section className="profile-page section-padding bg-light">
      <div className="container">
        <SectionHeader subtitle="My Account" title="Customer Profile" desc="Manage your orders and personal details" />

        <div className="profile-layout">
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="profile-card">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar-large">
                  {isAvatarImage ? (
                    <img src={customer.avatar} alt={`${customer.name}'s profile`} />
                  ) : (
                    getInitials(customer.name)
                  )}
                </div>
                <button
                  type="button"
                  className="profile-avatar-camera"
                  title="Change profile picture"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <CameraIcon size={18} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>
              <h3 className="profile-name">{customer.name}</h3>
              <p className="profile-member">
                <ClockIcon size={14} /> Member since {customer.memberSince}
              </p>
              <div className="profile-contact">
                <div className="profile-contact-item">
                  <EmailIcon size={16} /> <span className="profile-email-text" title={customer.email}>{customer.email}</span>
                </div>
                <div className="profile-contact-item">
                  <PhoneIcon size={16} /> <span>{customer.phone || "No phone added"}</span>
                </div>
                <div className="profile-contact-item">
                  <LocationIcon size={16} /> <span>{customer.location || "No address added"}</span>
                </div>
              </div>
              {photoMsg && (
                <div className={`profile-photo-msg ${photoMsg.includes("success") ? "success" : "error"}`}>
                  {photoMsg}
                </div>
              )}
              <button
                className="profile-edit-btn"
                onClick={() => {
                  setActiveTab("profile");
                  startEditing();
                }}
              >
                <EditIcon size={16} />
                <span>Edit Profile</span>
              </button>
              <button className="profile-logout-btn" onClick={handleLogout}>
                <LogOutIcon size={16} />
                <span>Logout</span>
              </button>
              <button className="profile-delete-btn" onClick={() => setShowDeleteModal(true)}>
                <TrashIcon size={16} />
                <span>Delete Account</span>
              </button>
            </div>

            <div className="profile-stats-card">
              <div className="profile-stat">
                <span className="profile-stat-number">{orderHistory.length}</span>
                <span className="profile-stat-label">Orders</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-number">{favorites.length}</span>
                <span className="profile-stat-label">Favorites</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-number">{formatINRValue(orderHistory.reduce((sum, o) => sum + (o.total || 0), 0))}</span>
                <span className="profile-stat-label">Total Spent</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="profile-main">
            {/* Tabs */}
            <div className="profile-tabs">
              {["profile", "orders", "favorites"].map((tab) => (
                <button
                  key={tab}
                  className={`profile-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "orders" ? "Order History" : tab}
                </button>
              ))}
            </div>

            {/* Tab: Profile Info */}
            {activeTab === "profile" && (
              <div className="profile-info-section">
                {successMsg && (
                  <div className="profile-success-msg">
                    <CheckIcon size={18} />
                    <span>{successMsg}</span>
                  </div>
                )}
                <div className="profile-info-card">
                  <div className="profile-card-header">
                    <h4>Personal Information</h4>
                    {!isEditing && (
                      <button className="profile-edit-inline-btn" onClick={startEditing}>Edit</button>
                    )}
                  </div>

                  {isEditing ? (
                    <form className="profile-edit-form" onSubmit={handleSave} noValidate>
                      <div className="profile-info-grid">
                        <div className={`profile-info-field ${errors.name ? "error" : ""}`}>
                          <label>Full Name</label>
                          <input type="text" name="name" placeholder="Your full name" value={formData.name} onChange={handleChange} className={errors.name ? "error" : ""} />
                          {errors.name && <span className="profile-field-error">{errors.name}</span>}
                        </div>
                        <div className="profile-info-field">
                          <label>Email Address</label>
                          <input type="email" value={customer.email} disabled />
                        </div>
                        <div className={`profile-info-field ${errors.phone ? "error" : ""}`}>
                          <label>Phone Number</label>
                          <input type="tel" name="phone" placeholder="10-digit Indian mobile number" maxLength={10} value={formData.phone} onChange={handleChange} className={errors.phone ? "error" : ""} />
                          {errors.phone && <span className="profile-field-error">{errors.phone}</span>}
                        </div>
                        <div className={`profile-info-field ${errors.location ? "error" : ""}`}>
                          <label>Address</label>
                          <input type="text" name="location" placeholder="Street, City, State" value={formData.location} onChange={handleChange} className={errors.location ? "error" : ""} />
                          {errors.location && <span className="profile-field-error">{errors.location}</span>}
                        </div>
                      </div>
                      <div className="profile-edit-actions">
                        <button type="submit" className="profile-save-btn">Save Changes</button>
                        <button type="button" className="profile-cancel-btn" onClick={cancelEditing}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="profile-info-grid">
                      <div className="profile-info-field"><label>Full Name</label><p>{customer.name}</p></div>
                      <div className="profile-info-field"><label>Email Address</label><p className="profile-info-email">{customer.email}</p></div>
                      <div className="profile-info-field"><label>Phone Number</label><p>{customer.phone || "Not added yet"}</p></div>
                      <div className="profile-info-field"><label>Address</label><p>{customer.location || "Not added yet"}</p></div>
                    </div>
                  )}
                </div>
                <div className="profile-info-card">
                  <h4>Preferences</h4>
                  <div className="profile-preferences">
                    {[
                      ["Favorite Coffee", "Caramel Macchiato"],
                      ["Preferred Milk", "Oat Milk"],
                      ["Size Preference", "Large (16 oz)"],
                      ["Newsletter", "Subscribed"],
                    ].map(([label, value]) => (
                      <div key={label} className="preference-item">
                        <span>{label}</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Order History */}
            {activeTab === "orders" && (
              <div className="profile-orders-section">
                {/* Dashboard Stats */}
                <div className="profile-orders-stats">
                  <div className="profile-orders-stat">
                    <span className="profile-orders-stat-icon"><BagIcon size={20} /></span>
                    <div>
                      <span className="profile-orders-stat-number">{orderHistory.length}</span>
                      <span className="profile-orders-stat-label">Total Orders</span>
                    </div>
                  </div>
                  <div className="profile-orders-stat">
                    <span className="profile-orders-stat-icon"><CoffeeIcon size={20} /></span>
                    <div>
                      <span className="profile-orders-stat-number">{formatINRValue(orderHistory.reduce((sum, o) => sum + (o.total || 0), 0))}</span>
                      <span className="profile-orders-stat-label">Total Spent</span>
                    </div>
                  </div>
                  <div className="profile-orders-stat">
                    <span className="profile-orders-stat-icon"><CheckIcon size={20} /></span>
                    <div>
                      <span className="profile-orders-stat-number">{orderHistory.reduce((sum, o) => sum + (o.items ? o.items.length : 0), 0)}</span>
                      <span className="profile-orders-stat-label">Items Ordered</span>
                    </div>
                  </div>
                </div>

                {orderHistory.length === 0 ? (
                  <>
                    <div className="profile-orders-empty">
                      <div className="profile-orders-empty-icon">
                        <BagIcon size={48} />
                      </div>
                      <h3>No Orders Yet</h3>
                      <p>Your order dashboard is waiting for its first brew. Explore our menu and place your first order — it'll show up here.</p>
                      <Link to="/menu" className="btn btn-primary">Browse Menu</Link>
                    </div>

                    <div className="profile-popular-section">
                      <div className="profile-popular-header">
                        <h4><StarIcon size={16} /> Popular Right Now</h4>
                        <Link to="/menu" className="profile-popular-link">View Full Menu <ArrowRightIcon size={14} /></Link>
                      </div>
                      <div className="profile-popular-grid">
                        {popularItems.map((item) => (
                          <div key={item.id} className="profile-popular-card">
                            <div className="profile-popular-emoji">{item.emoji}</div>
                            <div className="profile-popular-info">
                              <h5>{item.name}</h5>
                              <p>{item.desc}</p>
                              <span className="profile-popular-price">{formatINR(item.price)}</span>
                            </div>
                            <Link to={`/menu/${item.id}`} className="profile-popular-btn">Order Now</Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="profile-orders-list-heading">
                      <h4><TruckIcon size={16} /> Your Orders</h4>
                      <span className="profile-orders-count">{orderHistory.length} total</span>
                    </div>
                    {orderHistory.map((order) => {
                      const statusIndex = getStatusIndex(order.status);
                      return (
                        <div key={order.id} className="profile-order-card">
                          <div className="profile-order-header">
                            <div>
                              <span className="profile-order-id">{order.id}</span>
                              <span className="profile-order-date">{order.date}</span>
                            </div>
                            <div className="profile-order-header-right">
                              <span className="profile-order-item-count">{order.items ? order.items.length : 0} items</span>
                              <span className={`profile-order-status ${getStatusClass(order.status)}`}>{order.status}</span>
                            </div>
                          </div>
                          <div className="profile-order-items">
                            {order.items.map((item, idx) => (
                              <span key={idx} className="profile-order-item">{item}</span>
                            ))}
                          </div>

                          {/* Status Tracker */}
                          <div className={`profile-order-tracker ${statusIndex === 0 ? "has-progress-25" : ""} ${statusIndex === 1 ? "has-progress-50" : ""} ${statusIndex === 2 ? "has-progress-75" : ""} ${statusIndex === 3 ? "has-progress-100" : ""}`}>
                            <div className="tracker-line"></div>
                            <div className={`progress ${statusIndex === 0 ? "has-25" : ""} ${statusIndex === 1 ? "has-50" : ""} ${statusIndex === 2 ? "has-75" : ""} ${statusIndex === 3 ? "has-100" : ""}`}></div>
                            {trackerSteps.map((step, idx) => (
                              <div key={step.label} className={`tracker-step ${idx <= statusIndex ? "active" : ""} ${statusIndex < 0 ? "cancelled" : ""}`}>
                                <div className={`tracker-dot ${idx <= statusIndex ? "active" : ""} ${statusIndex < 0 ? "cancelled" : ""}`}>
                                  {idx < statusIndex || (idx === statusIndex && statusIndex === trackerSteps.length - 1) ? <CheckIcon size={12} /> : step.icon}
                                </div>
                                <span className={`tracker-label ${idx <= statusIndex ? "active" : ""}`}>{step.label}</span>
                              </div>
                            ))}
                          </div>

                          <div className="profile-order-footer">
                            <span className="profile-order-total">{formatINRValue(order.total)}</span>
                            <button className="profile-reorder-btn" onClick={() => window.location.href = "/menu"}>Reorder</button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}

            {/* Tab: Favorites */}
            {activeTab === "favorites" && (
              <div className="profile-favorites-section">
                {favorites.length === 0 ? (
                  <div className="profile-favorites-empty">
                    <HeartIcon size={48} />
                    <h3>No Favorites Yet</h3>
                    <p>Start adding your favorite items from the menu!</p>
                    <Link to="/menu" className="btn btn-primary">Browse Menu</Link>
                  </div>
                ) : (
                  <div className="favorites-grid">
                    {favorites.map((item) => (
                      <div key={item.id} className="favorite-card">
                        <button className="favorite-remove-btn" onClick={() => removeFavorite(item.id)} title="Remove from favorites">
                          <TrashIcon size={14} />
                        </button>
                        <ProductImage src={item.image} alt={item.name} emoji={item.emoji} className="favorite-image" />
                        <div className="favorite-info">
                          <h4 className="favorite-name">{item.name}</h4>
                          <p className="favorite-desc">{item.desc}</p>
                          <p className="favorite-orders">
                            <StarIcon size={14} />{" "}
                            {timesOrdered(item.name) === 1 ? "Ordered 1 time" : `Ordered ${timesOrdered(item.name)} times`}
                          </p>
                          <span className="favorite-price">{formatINR(getCanonicalPrice(item))}</span>
                        </div>
                        <div className="favorite-actions">
                          <button className="favorite-cart-btn" onClick={() => handleAddFavoriteToCart(item)}>Add to Cart</button>
                          <Link to={`/menu/${item.id}`} className="favorite-order-btn">View Item</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <WarningIcon size={40} />
            </div>
            <h3 className="modal-title">Delete Account?</h3>
            <p className="modal-desc">
              This action is <strong>permanent</strong>. All your data — including order history, favorites, and personal information — will be removed and cannot be recovered.
            </p>
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="modal-confirm-btn" onClick={handleDeleteAccount}>Yes, Delete My Account</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Profile;
