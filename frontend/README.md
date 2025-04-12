# Frontend structure and documentation

## Folder structure

    frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── src/
    │   ├── pages/
    │   │   ├── chat.html
    │   │   ├── dashboard.html
    │   │   ├── exercises.html
    │   │   ├── info.html
    │   │   ├── login.html
    │   │   ├── settings.html
    │   │   ├── signup.html
    │   │   └── tetris.html
    │   ├── scripts/
    │   │   ├── chat.js
    │   │   ├── dashboard.js
    │   │   ├── exercises.js
    │   │   ├── info.js
    │   │   ├── login.js
    │   │   ├── main.js
    │   │   ├── polarConnect.js
    │   │   ├── settings.js
    │   │   ├── signup.js
    │   │   └── tetris.js
    │   └── styles/
    │       └── tailwind.css
    └── public/
        ├── images/
        │   ├── logo.svg
        │   └── icons/
        └── sounds/
            ├── nature/
            ├── ambient/
            └── meditation/

## Initiation

1.  Install node modules if not already done

        cd frontend
        npm install

2.  Start the server

        npm run dev
