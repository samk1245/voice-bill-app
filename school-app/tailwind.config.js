/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        school: {
          primary: "#1e3a8a", // Classic deep scholarly blue
          primaryDark: "#172554",
          accent: "#d97706",  // Warm cheerful saffron/amber
          accentLight: "#fef3c7",
          green: "#15803d",   // Growth, vitality, eco
          greenLight: "#dcfce7",
          warmBg: "#faf9f6",  // Soft warm paper white
          cardBorder: "#e2e8f0",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "'Helvetica Neue'",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
