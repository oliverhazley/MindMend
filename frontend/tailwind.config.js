// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    // .html files are in `src/pages`:
    "./src/pages/**/*.html",
    // js is in `src/scripts`:
    "./src/scripts/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#2A2F3D",
          DEFAULT: "#1D202B",
        },
        card: {
          DEFAULT: "#252A37",
        },
        accent: {
          DEFAULT: "#1E90FF", // bright accent
        },
        success: {
          DEFAULT: "#3CB371",
        },
        danger: {
          DEFAULT: "#e53e3e",
        },
      },
    },
  },
  plugins: [],
};
