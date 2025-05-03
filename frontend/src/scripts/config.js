// src/scripts/config.js
// we use this for setting both paths without needing to edit them later
const IS_DEV = window.location.hostname === "localhost";

export const API_BASE_URL = IS_DEV
  ? "http://localhost:3000/api" // Dev backend
  : "https://mind-mend.azurewebsites.net/api"; // Production backend
