import { createContext, useContext, useReducer, useCallback, useEffect, useState } from "react";
import { FALLBACK_ITEMS } from "../data/menuItems";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

const CART_STORAGE_KEY = "brewbliss_cart";

// Immediately clean up any stale legacy guest cart if user is not logged in
try {
  const savedUserStr = localStorage.getItem("brewbliss_user");
  if (!savedUserStr) {
    localStorage.removeItem(CART_STORAGE_KEY);
  }
} catch {
  // Ignore
}

export const generateItemKey = (item) => {
  if (!item) return "item_default";
  const base = item.id;
  const customKey =
    Array.isArray(item.selectedIngredients) && item.selectedIngredients.length > 0
      ? [...item.selectedIngredients].sort().join("|")
      : "default";
  return `${base}_${customKey}`;
};

export const sanitizeCartItems = (rawItems) => {
  if (!Array.isArray(rawItems)) return [];
  return rawItems
    .map((item) => {
      if (!item) return null;
      let numericPrice = parseFloat(String(item.price).replace(/[^0-9.-]+/g, ""));
      const canonical = FALLBACK_ITEMS.find((f) => f.id === item.id);
      if (canonical) {
        numericPrice = canonical.price;
      } else if (numericPrice >= 30) {
        numericPrice = Math.round((numericPrice / 83) * 100) / 100;
      }
      return {
        ...item,
        price: numericPrice,
        quantity: Math.max(1, Number(item.quantity) || 1),
        itemKey: item.itemKey || generateItemKey(item),
      };
    })
    .filter(Boolean);
};

const loadInitialCart = () => {
  try {
    const savedUserStr = localStorage.getItem("brewbliss_user");
    const userEmail = savedUserStr ? JSON.parse(savedUserStr)?.email : null;
    if (userEmail) {
      // Logged in user: load their personalized saved cart
      const saved = localStorage.getItem(`brewbliss_cart_${userEmail}`);
      if (saved) {
        return sanitizeCartItems(JSON.parse(saved));
      }
    } else {
      // Guest: clear any persistent storage so default items NEVER appear
      localStorage.removeItem(CART_STORAGE_KEY);
      const guestSaved = sessionStorage.getItem(CART_STORAGE_KEY);
      if (guestSaved) {
        return sanitizeCartItems(JSON.parse(guestSaved));
      }
    }
  } catch {
    // Ignore parse errors
  }
  return [];
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART":
      return sanitizeCartItems(action.payload);

    case "ADD_TO_CART": {
      const addQty = Math.max(1, Number(action.payload.quantity) || 1);
      const newItemKey = generateItemKey(action.payload);
      const existing = state.find(
        (item) => (item.itemKey || generateItemKey(item)) === newItemKey
      );
      // Parse price as number (canonicalize to USD to prevent double INR x83 conversion)
      let numericPrice = parseFloat(String(action.payload.price).replace(/[^0-9.-]+/g, ""));
      const canonical = FALLBACK_ITEMS.find((f) => f.id === action.payload.id);
      if (canonical) {
        numericPrice = canonical.price;
      } else if (numericPrice >= 30) {
        numericPrice = Math.round((numericPrice / 83) * 100) / 100;
      }
      if (existing) {
        return state.map((item) =>
          (item.itemKey || generateItemKey(item)) === newItemKey
            ? { ...item, quantity: item.quantity + addQty }
            : item
        );
      }
      return [
        ...state,
        {
          ...action.payload,
          price: numericPrice,
          quantity: addQty,
          itemKey: newItemKey,
        },
      ];
    }

    case "REMOVE_FROM_CART":
      return state.filter(
        (item) => (item.itemKey || generateItemKey(item)) !== action.payload
      );

    case "UPDATE_QUANTITY":
      if (action.payload.quantity <= 0) {
        return state.filter(
          (item) => (item.itemKey || generateItemKey(item)) !== action.payload.itemKey
        );
      }
      return state.map((item) =>
        (item.itemKey || generateItemKey(item)) === action.payload.itemKey
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

    case "CLEAR_CART":
      return [];

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const currentEmail = user?.email || null;
  const [items, dispatch] = useReducer(cartReducer, [], loadInitialCart);
  const [syncedEmail, setSyncedEmail] = useState(currentEmail);

  // Sync cart when user logs in, switches, or logs out
  useEffect(() => {
    if (currentEmail !== syncedEmail) {
      const wasLoggedIn = Boolean(syncedEmail);
      setSyncedEmail(currentEmail);
      if (currentEmail) {
        try {
          const userSaved = localStorage.getItem(`brewbliss_cart_${currentEmail}`);
          if (userSaved) {
            const userCart = sanitizeCartItems(JSON.parse(userSaved));
            if (userCart.length > 0 && items.length === 0) {
              dispatch({ type: "SET_CART", payload: userCart });
              return;
            }
          }
          if (items.length > 0) {
            localStorage.setItem(`brewbliss_cart_${currentEmail}`, JSON.stringify(items));
          }
        } catch {
          // Ignore
        }
      } else if (wasLoggedIn) {
        // User logged out! Reset active cart so guest session is empty
        dispatch({ type: "CLEAR_CART" });
        try {
          localStorage.removeItem(CART_STORAGE_KEY);
        } catch {
          // Ignore
        }
      }
    }
  }, [currentEmail, syncedEmail, items]);

  // Persist cart whenever items change
  useEffect(() => {
    try {
      if (currentEmail) {
        localStorage.setItem(`brewbliss_cart_${currentEmail}`, JSON.stringify(items));
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } else if (items.length > 0) {
        sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } else {
        localStorage.removeItem(CART_STORAGE_KEY);
        sessionStorage.removeItem(CART_STORAGE_KEY);
      }
    } catch {
      // Ignore
    }
  }, [items, currentEmail]);

  const addItem = (item) => {
    dispatch({ type: "ADD_TO_CART", payload: item });
  };

  const removeItem = (itemKey) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: itemKey });
  };

  const updateQuantity = (itemKey, quantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { itemKey, quantity } });
  };

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      sessionStorage.removeItem(CART_STORAGE_KEY);
      const savedUserStr = localStorage.getItem("brewbliss_user");
      const userEmail = savedUserStr ? JSON.parse(savedUserStr)?.email : null;
      if (userEmail) {
        localStorage.removeItem(`brewbliss_cart_${userEmail}`);
      }
    } catch {
      // Ignore
    }
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        tax,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartContext;
