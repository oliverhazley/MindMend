# Backend structure and documentation

## Folder structure

    backend/
    ├── package.json
    ├── .env
    └── src/
       ├── index.js
       ├── config/
       │   └── database.js
       ├── controllers/
       │   └── userController.js
       ├── models/
       │   └── userModel.js
       ├── routes/
       │   └── userRoutes.js
       ├── middleware/
       │   ├── auth.js
       │   └── errorHandler.js
       └── utils/
           ├── validators/
           │   └── userValidator.js
           └── database.js

## Initiation

1.  Install node modules if not already done

        cd backend
        npm install

2.  Start the server

        npm run dev
