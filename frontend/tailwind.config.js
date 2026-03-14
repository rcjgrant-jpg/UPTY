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
          yellow: "#F4D35E",
          yellowSoft: "#FBE89A",
          lavender: "#B8A1E3",
          lavenderSoft: "#E9E0F7",
          blue: "#3FA7D6",
          blueDeep: "#2563EB",
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

