// tailwind.config.cjs
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx,html}"
  ],
  theme: {
    extend: {
      colors: {
        brand: "#010237",
        accent: "#7c5cff",
        soft: "#f4f6ff"
      },
      borderRadius: {
        xl2: "1rem"
      }
    }
  },
  plugins: []
};
