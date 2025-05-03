// src/scripts/config.js
// we use this for setting both paths without needing to edit them later
// THIS IS THE CONFIGURATION FILE FOR THE FRONTEND.
// IT CONTAINS THE BASE URL FOR THE API, WHICH IS USED THROUGHOUT THE APP.
// IT ALSO CONTAINS THE IS_DEV CONSTANT, WHICH IS USED TO DETERMINE IF WE ARE IN DEV OR PRODUCTION MODE.
// NEEDS TO BE EDITED FOR PRODUCTION.
// -----------------------------------------------------------------------------

const IS_DEV = window.location.hostname === "localhost";

export const API_BASE_URL = IS_DEV
  ? "http://localhost:3000/api" // Dev backend
  : "https://mind-mend.azurewebsites.net/api"; // Production backend
