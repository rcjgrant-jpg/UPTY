/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#F9DC82",       // Jasmine
          yellowSoft: "#FFF4CC",   // lighter jasmine tint
          lavender: "#95A1F8",     // Wisteria Blue
          lavenderSoft: "#EEF1FF", // soft tinted background
          blue: "#7157F7",         // Majorelle Blue
          blueDeep: "#2854C5",     // Sapphire

          cream: "#FFFDF7",
          surface: "#FFFFFF",
          text: "#1F2937",
          muted: "#6B7280",
          border: "#E5E7EB",
        },
      },
      boxShadow: {
        soft: "0 4px 16px rgba(0, 0, 0, 0.06)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};

