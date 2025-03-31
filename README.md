# MindMend

## FRONT END Project initiation instructions 

### 1. check versions : 

    node --version
    npm --version


### 2. package.json

    cd Front
    npm init -y


### 3. vite

    npm install --save-dev vite


### 4. tailwind

    npm install -D tailwindcss@3.3.4 postcss autoprefixer
    npx tailwindcss init -p


### 5. update package.json

      "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
      },



### 6. tailwind.config.js

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
          },
        },
      },
      plugins: [],
    };



### 7. Structure for frontend

    Front
    ├── node_modules             //  do not edit manually
    ├── pages
    │   ├── chat.html
    │   ├── dashboard.html
    │   ├── exercises.html
    │   ├── info.html
    │   ├── login.html
    │   ├── settings.html
    │   ├── signup.html
    │   └── tetris.html
    ├── public
    │   └── sounds
    │       └── therapy-sound.mp3  // exercise sounds go here... 
    │   └── images                 // images here
    ├── src
    │   ├── scripts
    │   │   ├── chat.js
    │   │   ├── dashboard.js
    │   │   ├── exercises.js
    │   │   ├── info.js
    │   │   ├── login.js
    │   │   ├── main.js
    │   │   ├── settings.js
    │   │   ├── signup.js
    │   │   └── tetris.js
    │   └── styles
    │       └── tailwind.css      // just links tailwind to our project
    ├── .gitignore                // dont push this
    ├── index.html                // Landing page
    ├── package.json              // Auto-generated after `npm install`
    ├── package-lock.json         // Auto-generated after `npm install`
    ├── postcss.config.js         // Auto-generated after `npm install`
    ├── tailwind.config.js        // add custom styles here
    └── vite.config.js            // (minimal config for Vite)


  