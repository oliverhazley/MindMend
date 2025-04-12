<<<<<<< HEAD:Front/tailwind.config.js
/*
  tailwind.config.js
  Tells Tailwind which files to scan, plus sets up dark theme & color palette.
*/

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./pages/**/*.html",
    "./src/**/*.{js,ts}"
  ],
  theme: {
    extend: {
      // Example dark/blueish gradient styling
      colors: {
        primary: {
          light: "#2A2F3D", // mid-dark background
          DEFAULT: "#1D202B", // main dark background
        },
        card: {
          DEFAULT: "#252A37", // card background color
        },
        accent: {
          DEFAULT: "#1E90FF", // a bright accent color (e.g. for buttons)
        },
        success: {
          DEFAULT: "#3CB371", // green for "connected"
        },
        danger: {
          DEFAULT: "#e53e3e", // red for "disconnected" or alerts
        },
        // add more here
=======
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
>>>>>>> miska:frontend/tailwind.config.js
      },
    },
  },
  plugins: [],
<<<<<<< HEAD:Front/tailwind.config.js
};
=======
};
>>>>>>> miska:frontend/tailwind.config.js
