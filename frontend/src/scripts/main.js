/*
  main.js
  - This file is loaded in "index.html" as the site's main entry point.
  - It imports the Tailwind CSS so that Vite can bundle and serve it live.
  - Contains any global logic you'd like to run on the landing page or site-wide tasks.
*/

// Import Tailwind entry CSS so that the dev server can compile & inject it
import "../styles/tailwind.css";

document.addEventListener("DOMContentLoaded", () => {
  console.log("main.js loaded: global/landing page logic goes here.");

  // Example of a site-wide check for user authentication:
  // const token = localStorage.getItem('token');
  // if (token) {
  //   // Possibly show user-specific nav items or redirect
  // }
});
