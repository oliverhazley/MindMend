<div align="center">
   <h1>MindMend - Frontend Documentation</h1>
   <img src="./public/images/mmlogo.webp" alt="MindMend Logo" width="400"/>
</div>


Welcome to the **Frontend** documentation of **MindMend**, a mental wellness and PTSD management application designed to help users manage stress and improve mental health through cutting-edge features like HRV monitoring and guided relaxation exercises.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Links](#links)
3. [Core Features](#core-features)
4. [Project Structure](#project-structure)
5. [Libraries and Tools](#libraries-and-tools)
6. [Known Issues](#known-issues)
7. [References](#references)
8. [Setup Instructions](#setup-instructions)

---

## Introduction

MindMend's frontend serves as the user interface for the application. It is designed to be intuitive, responsive, and visually appealing, providing seamless access to the app's functionalities.

---

## Links

- **Root README**: [MindMend README](../README.md)  
- **Backend Documentation**: [Backend README](../backend/README.md)  
- **Testing Documentation**: [Testing README](../tests/README.md)  

---

## Core Features


### 1. **Landing page**

   A stylish landing page with a background (SVG converted to webp) and a brief description of the app. We have buttons to log in or sign up. Since its a SPA (Single page application), We hide our protected routes with a simple if statement in the main.js file. The landing page is also responsive and works on mobile devices.
![Landing](../readmeIMG/landing.webp)

---

### 2. **Theme toggle**

   The user can toggle between light and dark mode. The theme is saved in local storage. Default is dark mode. Fully mobile responsive. We have a seperate webp image for the light mode background. The user can change themes by pressing the Sun (light) or Moon (dark) icon in the navbar. Changes to styling are made in the tailwind.css file via: 
    
    body.light-mode .id

![theme](../readmeIMG/landingtheme.webp)

---

### 2. **Localization (Language selection)**

   The user can select between English and Finnish. The default is English. The language is saved in local storage. We use a i18n.js file to handle the translations. The translations are stored in json files in the locales folder. The user can select the language via a dropdown menu in the navbar. The translations are done using the i18n library. The translations are stored in json files in the locales folder. The user can select the language by pressing the "EN / FI" button in the navbar.

![lang](../readmeIMG/translate.webp)

---

### 3. **Login & Registration**

The user can log in via email and password. The user can register via email, password and name. We check for duplicate emails in the database. We check to make sure the passwords match. Logging in will create a JWT key.


![reg](../readmeIMG/signup.webp)
![log](../readmeIMG/Login.webp)

--- 

### 4. **HRV Monitoring (dashboard)**

   Once the user has logged in, or a JWT key is in storage, the user is redirected to the dashboard. The user can connect to the Polar H10 heart rate monitor via Web Bluetooth. The dashboard shows HRV data in various forms, including - Live pulse, RMSSD, and RR intervals, aswell as data trends taken from the database, and calulcated in our dashboard.js logic.
We used chart.js to create the graphs. The dashboard is fully responsive and works on mobile devices. This is essentially the heart and soul of our application. Live, Realtime data being collected and calculated for the user.

Disclaimer: The Polar H10 connection does not work on Apple devices due to Safari's requirement for the WebKit API, which does not support Web Bluetooth. The connection works on Android devices and Windows computers.
   
![dashboard](../readmeIMG/dash.gif)

--- 

### 5. **Meditation**

On our meditation page, the user can activate different sounds and complete relaxation exercises. The user can also complete breathing exercises. They have access to their current Pulse and RMSSD values while doing the exercises. The content of this page is filled via javascript, in a modular fashion.
This means, we can easily add more content in the future.

![meditation](../readmeIMG/meditat.gif)

---

### 6. **Tetris**

The user can play a relaxing game of Tetris. The game is fully responsive and works on mobile devices. The game is simple with no sound or music. 

The gameplay logic was mostly built by ChatGPT with a few small tweaks (We didn't want to spend our time working on it, since it wasn't the main focus of the project). Styling was done by us to fit our theme.

The user can use their keyboard arrow keys to move the pieces, and mobile they can swipe. There is a score, but it is not saved anywhere, This could be added in future - if we want to keep working on the project (a highscore table would be a nice addition, but again, this wasn't the focus of our project).
The player can start a game, pause a game, or restart there game. On game over, the user receives a "Game Over" popup notification.

![Tetris](../readmeIMG/tetris.gif)

---

### 7. **MindMend Chatbot**

The chatbot runs via OpenAI's API, we are using the gpt-3.5-turbo model. Its fully responsive and works on mobile devices.

Our chatbot can answer questions about the app, stress, coping techniques, and general mental health. We have tried to train it **not** to answer stupid or **off topic** questions, but if you try hard enough, you can "jailbreak" it. (it's a work in progress). We are very pleased with how it acts though. If the user has questions that fall outside the role of support (something serious) it prompts the user to contact a professional.

The chatbot supports both english and finnish, however currently it will sometimes respond in english even if the user is using finnish. We are working on this issue.

We also attempted to train the bot on the apps structure, in order to help users find features within the app - this was succesful to an extent. (We chose to do this because during our user testing, some users had difficulties finding features, like - Exporting data to a therapist) - we plan to refine this in the future.

![chat](../readmeIMG/chat.webp)

---

### 8. **Info Section**

Our info sections contains basic information about the app, how it helps, what HRV is, and why its relevant to ptsd. It has "Accordian" functionality. The user can open and close the different info boxes. 

It also contains instructions on how to export data for a therapist (During our user testing, numerous testers had difficulties finding the export feature. so we added a tidbit to help them.)

![info](../readmeIMG/info.webp)

---

### 9. **Profile**

In our profile section, the user can view their name & email. They can change their password, and even delete their account.

We also have secondary buttons here to connect to the Polar-H10, and to export data for a therapist. (This is because of the issues we discovered during our user testing).

![info](../readmeIMG/profile.webp)

---

### 10. **Logging out**

Our logout button is situated in our navbar - Clicking it takes the user back to the landing page. When a user logs out, it clears the JWT key from local storage, along with their user_id and catched HRVdata.

![logout](../readmeIMG/logout.webp)

---

### 10. **Device connection & realtime data visualization**

To connect to the Polar-H10 device, the user needs to press the **Connect** button on the dashboard, or the profile section (Bluetooth must be enabled). After pressing connect, This will display a list of avalible devices. The user should select their device and press pair.

After pairing the device our interface will show "Connecting..." and then "Connected" once its successfully connected. The user can then view their realtime data on the dashboard. The data is displayed in a graph, and the user can see their current pulse, RMSSD, and RR intervals (Realtime data).

This data is saved to the database, and the user can view their data trends at the bottom of the dashboard. The data is saved every 3 minutes, and the user can view their data for the last 24 hours, 7 days, 30 days or 365 days. There is a filter above the **Trend** displays.

The connection uses the Web Bluetooth API, which allows web applications to connect to Bluetooth devices. The connection is established using the `navigator.bluetooth.requestDevice` method, which prompts the user to select a Bluetooth device. Once the device is selected, we use the `gatt.connect()` method to establish a connection.
(Unfortunately this does not work on Apple devices due to Safari's requirement for the WebKit API, which does not support Web Bluetooth.)

![connect](../readmeIMG/connect.gif)

---

### 10. **PDF export**

The user can export their HRV data to a PDF file. The PDF contains a summary of HRV trend data. The PDF is generated using the jsPDF library.

![pdf](../readmeIMG/PDF.gif)

---

## Project Structure

The frontend is organized as follows:


    frontend/
    ├── index.html
    ├── .env
    ├── README.md
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── src/
    │   ├── scripts/
    │   │   ├── chat.js
    │   │   ├── config.js
    │   │   ├── dashboard.js
    │   │   ├── exercises.js
    │   │   ├── ExportData.js
    │   │   ├── i18n.js
    │   │   ├── info.js
    │   │   ├── login.js
    │   │   ├── logout.js
    │   │   ├── main.js
    │   │   ├── navbar.js
    │   │   ├── polarConnect.js
    │   │   ├── router.js
    │   │   ├── settings.js
    │   │   ├── signup.js
    │   │   └── tetris.js
    │   └── styles/
    │       └── tailwind.css
    └── public/
        ├── images/
        │   ├── bg1.webp
        │   ├── bgLight.webp
        │   └── mmlogo.webp
        ├── locales/
        │   ├── en.json
        │   └── fi.json
        └── sounds/
            ├── fire.mp3
            ├── rain.mp3
            └── stream.mp3


---

## Libraries and Tools

### Frontend Libraries
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Chart.js**: Data visualization library.
- **jspdf**: For generating PDFs from HRV data.
- **Web Bluetooth**: For connecting to Polar H10 heart rate monitor.
- **Lucide Icons**: Icon library for UI components.

### Development Tools
- **Vite**: Fast frontend build tool.
- **PostCSS**: CSS processing tool.
- **ESLint & Prettier**: For linting and code formatting.
- **Git**: Version control system.
- **Node.js**: JavaScript runtime for development and build processes.
- **npm**: Package manager for JavaScript.
- **netlify**: For deploying the frontend application.

---


### Known Issues
- **Polar H10 Connection**: Does not work on Apple devices due to Safari's requirement for the WebKit API, which does not support Web Bluetooth.
- **Chatbot Language**: Sometimes responds in English even if the user is using Finnish.
- **RMSSD Calculation**: The RMSSD calculation is not always accurate due to the nature of the data being collected. We are working on improving the filtering and calculation methods.
---

## References

- Icons from [Lucide](https://lucide.dev/)
- Sounds from [Freesound](https://freesound.org/)
- SVG backgrounds generated with [Haikei](https://haikei.app)
- Frontend Framework: Tailwind CSS
- Backend Framework: Node.js with Express.js
- Database: MariaDB MySQL
- Data visualization [Chart.js](https://www.chartjs.org/)
- Web Bluetooth API for connecting to Polar H10
- Testing [Robot Framework](https://robotframework.org/)
- Stack overflow for bug fixing, help with various issues
- ChatGPT for bug fixing, and help with various issues
- Claude for bug fixing, and help with various issues
---


## Setup Instructions

1. Ensure you have the required Node.js version (>=18):
   ```bash
   node --version
   npm --version


---

## Initiation

The instructions below will help you set up the frontend of the MindMend application on a local machine. You will need a Polar-H10 device to get the full functionality of the application.

1.  Install node modules if not already done

        cd frontend
        npm install

2.  You will need to set up a .env file in the frontend directory with the following content:

        VITE_API_BASE_URL=http://localhost:3000/api

3.  Start the server

        npm run dev



4. You will then need to setup the backend
   - Follow the instructions in the [Backend README](../backend/README.md) to set up the backend server and database.
        

## Test User Credentials (for hosted build)

| Email             | Password |
|-------------------|----------|
| test123@gmail.com | test123  |

---
