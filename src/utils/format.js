// Currency & formatting helpers — Brew Bliss storefront
// Base menu prices are stored in USD (backend/data.json).
// This storefront displays & charges customers in INR (₹).

export const USD_TO_INR = 83;

// Convert a USD-amount (number or "$4.50" string) to INR number
export const usdToINR = (amount) => {
  const n = toNumber(amount);
  if (isNaN(n)) return 0;
  // Safety check: if amount is already an INR price (>= 30), do not multiply by 83 again
  if (n >= 30) return n;
  return n * USD_TO_INR;
};

// Format a USD-amount as INR (₹)
export const formatINR = (amount) => {
  const n = toNumber(amount);
  if (isNaN(n)) return "₹0.00";
  // Safety check: if amount is already in INR (>= 30 for any cafe item), format directly
  if (n >= 30) return formatINRValue(n);
  return formatINRValue(n * USD_TO_INR);
};

// Format a value that is already in INR
export const formatINRValue = (amountInINR) => {
  const n = Number(amountInINR) || 0;
  return (
    "₹" +
    n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

// Coerce a number or "$4.50"-style string into a plain number
const toNumber = (value) => {
  if (typeof value === "number") return value;
  return parseFloat(String(value).replace(/[^0-9.-]+/g, ""));
};

// Human-readable payment label for a payment method id
export const paymentLabel = (method) => {
  const map = {
    cod: "Cash on Delivery",
    upi: "UPI",
    card: "Debit / Credit Card",
    netbanking: "Net Banking",
    wallet: "Wallet",
  };
  return map[method] || method || "—";
};

// Format an ISO date as a friendly en-IN date/time string
export const formatDateTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format a date N days from today as a short weekday/day/month string
export const formatDateFromNow = (daysFromNow) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};
