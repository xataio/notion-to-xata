module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        grow: {
          "0%": { transform: "scale(0)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        grow: "grow .6s ease forwards",
      },
      fontFamily: {
        xata: "xata",
      },
      colors: {
        "softer-white": "#8F8F8F",
        "softest-white": "#6B6B6B",
        "softer-black": "#616161",
        "softest-black": "#787878",
        "primary-light-mode": "#4361EE",
        primary: "#7B91F4",
        accent: "#FF0075",
        "accent-dark": "#cc005f",
        caution: "#ffbe0b",
        success: "#08d69f",
      },
      gridTemplateColumns: {
        page: "400px auto",
      },
    },
  },
  plugins: [],
};
