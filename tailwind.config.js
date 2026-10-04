/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
extend: {
      colors: {
        espresso: {
          DEFAULT: "#2B1A12",
          light: "#3D2A1F",
          dark: "#1D0F08",
        },
        choco: {
          DEFAULT: "#2B1A12",
          light: "#3D2A1F",
        },
        gold: "#C68A3E",
        caramel: "#C68A3E",
        cream: "#FBF6EE",
        offwhite: "#FDFAF4",
        surface: "#FFFFFF",
        border: "rgba(43, 26, 18, 0.1)",
        muted: "#8A7A6A",
        inktone: "#2B1A12",
        success: "#4F8A5F",
      },
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'Poppins'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 14px 34px rgba(90, 62, 39, 0.1)",
        hover: "0 22px 48px rgba(90, 62, 39, 0.16)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
