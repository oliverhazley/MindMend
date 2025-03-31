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


### 6. Structure for frontend

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
    │   └── images
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


  