import { createContext, useContext, useState, useEffect } from "react";
import { FALLBACK_ITEMS } from "../data/menuItems";

const AuthContext = createContext();

const STORAGE_KEY_USER = "brewbliss_user";
const STORAGE_KEY_USERS = "brewbliss_users";

// Per-user storage keys (keyed by email) so each account has its own
// personalized order history and favorites.
const ordersKey = (email) => `brewbliss_orders_${email}`;
const favoritesKey = (email) => `brewbliss_favorites_${email}`;

// Simple hash function for storing passwords (not cryptographically secure, but better than plaintext)
const hashPassword = (password) => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return "hashed_" + Math.abs(hash).toString(16);
};

// Read a per-user array from localStorage
const readPerUser = (key, email) => {
  try {
    if (!email) return [];
    return JSON.parse(localStorage.getItem(key(email))) || [];
  } catch {
    return [];
  }
};

// Ensure all items in favorites use USD canonical prices to prevent double INR x83 conversion
const sanitizeFavoritesList = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map((item) => {
    const canonical = FALLBACK_ITEMS.find((f) => f.id === item.id);
    let price = typeof item.price === "number" ? item.price : parseFloat(String(item.price).replace(/[^0-9.-]+/g, ""));
    if (canonical) {
      price = canonical.price;
    } else if (price >= 30) {
      price = Math.round((price / 83) * 100) / 100;
    }
    return {
      ...item,
      price,
      image: canonical?.image || item.image,
      name: canonical?.name || item.name,
      desc: canonical?.desc || item.desc,
    };
  });
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.name && !(parsedUser.avatar || "").startsWith("data:")) {
          const parts = parsedUser.name.trim().split(/\s+/).filter(Boolean);
          const initials = parts.length > 1
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : (parts[0] ? parts[0].slice(0, 2).toUpperCase() : "U");
          parsedUser.avatar = initials;
        }
        return parsedUser;
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  });

  const [orderHistory, setOrderHistory] = useState(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        return readPerUser(ordersKey, parsedUser.email);
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        return sanitizeFavoritesList(readPerUser(favoritesKey, parsedUser.email));
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  });

  // Persist data when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [user]);

  // Persist order history to the current user's per-user key
  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem(ordersKey(user.email), JSON.stringify(orderHistory));
    }
  }, [orderHistory, user]);

  // Persist favorites to the current user's per-user key
  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem(favoritesKey(user.email), JSON.stringify(favorites));
    }
  }, [favorites, user]);

  // Get all registered users from localStorage
  const getUsers = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_USERS)) || [];
    } catch {
      return [];
    }
  };

  // Save users array to localStorage
  const saveUsers = (users) => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  };

  const login = (email, password) => {
    const users = getUsers();
    const storedUser = users.find((u) => u.email === email);

    if (!storedUser) {
      throw new Error("No account found with this email address");
    }

    const hashedInput = hashPassword(password);
    if (storedUser.password !== hashedInput) {
      throw new Error("Incorrect password. Please try again.");
    }

    // Login successful — set user data (without password)
    const userData = {
      name: storedUser.name,
      email: storedUser.email,
      phone: storedUser.phone || "",
      location: storedUser.location || "",
      memberSince: storedUser.memberSince,
      avatar: storedUser.avatar,
    };
    setUser(userData);

    // Load this user's personalized order history and favorites
    setOrderHistory(readPerUser(ordersKey, userData.email));
    setFavorites(sanitizeFavoritesList(readPerUser(favoritesKey, userData.email)));
    return userData;
  };

  const register = (name, email, password) => {
    const users = getUsers();

    // Check if email already exists
    if (users.some((u) => u.email === email)) {
      throw new Error("An account with this email already exists");
    }

    const hashedPassword = hashPassword(password);
    const memberSince = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" });
    const avatar = name.split(" ").map((n) => n.charAt(0)).join("").toUpperCase().slice(0, 2);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      phone: "",
      location: "",
      memberSince,
      avatar,
    };

    // Add to registered users
    saveUsers([...users, newUser]);

    // Set as current logged-in user (without password)
    const userData = {
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      location: newUser.location,
      memberSince: newUser.memberSince,
      avatar: newUser.avatar,
    };
    setUser(userData);

    // New account starts with empty order history and favorites
    setOrderHistory([]);
    setFavorites([]);
    return userData;
  };

  const updateProfile = (updates) => {
    if (!user) return;

    const next = { ...updates };
    // Recompute initials when the name changes (unless the user uploaded a photo)
    if (updates.name && !updates.avatar && !(user.avatar || "").startsWith("data:")) {
      next.avatar = updates.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }

    const users = getUsers();
    const updatedUsers = users.map((u) => {
      if (u.email === user.email) {
        return { ...u, ...next };
      }
      return u;
    });
    saveUsers(updatedUsers);

    // Update the current session user (without password)
    setUser((prev) => ({ ...prev, ...next }));
  };

  // Check if an email is registered (for forgot-password flow)
  const isEmailRegistered = (email) => {
    const users = getUsers();
    return users.some((u) => u.email === email);
  };

  // Reset a user's password (overwrites the stored hashed password)
  const resetPassword = (email, newPassword) => {
    const users = getUsers();
    const existing = users.find((u) => u.email === email);

    if (!existing) {
      throw new Error("No account found with this email address");
    }

    const updatedUsers = users.map((u) =>
      u.email === email ? { ...u, password: hashPassword(newPassword) } : u
    );
    saveUsers(updatedUsers);
    return true;
  };

  const logout = () => {
    // Clear the session state and guest cart
    setUser(null);
    setOrderHistory([]);
    setFavorites([]);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem("brewbliss_cart");
  };

  const deleteAccount = () => {
    if (!user) return;

    // Remove user from registered users list
    const users = getUsers();
    const filteredUsers = users.filter((u) => u.email !== user.email);
    saveUsers(filteredUsers);

    // Remove this user's personalized data (orders + favorites)
    localStorage.removeItem(ordersKey(user.email));
    localStorage.removeItem(favoritesKey(user.email));

    // Clear all session data
    setUser(null);
    setOrderHistory([]);
    setFavorites([]);
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  const addOrder = (order) => {
    setOrderHistory((prev) => [order, ...prev]);
  };

  const addFavorite = (item) => {
    const canonical = FALLBACK_ITEMS.find((f) => f.id === item.id);
    let price = typeof item.price === "number" ? item.price : parseFloat(String(item.price).replace(/[^0-9.-]+/g, ""));
    if (canonical) {
      price = canonical.price;
    } else if (price >= 30) {
      price = Math.round((price / 83) * 100) / 100;
    }
    const cleanItem = {
      ...item,
      price,
      image: canonical?.image || item.image,
      name: canonical?.name || item.name,
      desc: canonical?.desc || item.desc,
    };
    setFavorites((prev) => {
      if (prev.some((fav) => fav.id === cleanItem.id)) return prev;
      return [...prev, { ...cleanItem, orders: 1, addedAt: new Date().toISOString() }];
    });
  };

  const removeFavorite = (itemId) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== itemId));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        deleteAccount,
        updateProfile,
        isEmailRegistered,
        resetPassword,
        orderHistory,
        favorites,
        addOrder,
        addFavorite,
        removeFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
