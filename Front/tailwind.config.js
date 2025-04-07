/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ 
    "./index.html",
    "./pages/**/*.html",
    "./src/**/*.{js,ts}"],
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
      },
    },
  },
  plugins: [],
}

