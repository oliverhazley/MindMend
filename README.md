<div align="center">
   <h1>MindMend</h1>
   <img src="frontend/public/images/mmlogo.webp" alt="MindMend Logo" width="400"/>
</div>

MindMend is a mental wellness and PTSD management application that leverages Heart Rate Variability (HRV) data and evidence-based techniques. For full functionality, the user needs a "Polar H-10" device. The project has been designed with simplicity and functionality in mind, offering users tools for relaxation, mindfulness, and improved mental health.

This is a project at Metropolia UAS (2025) - Created by Oliver Hazley, Miska Nurminen, Safwat Salah & Sofia Taskinen.

---

## Links

- **Published Frontend Application**: [Frontend Link](#)
- **Backend API Service**: [Backend Link](#)
- **API Documentation**: [API Documentation](#)
- **Frontend README**: [Frontend-specific Documentation](frontend/README.md)
- **Backend README**: [Backend-specific Documentation](backend/README.md)
- **Testing README**: [Testing-specific Documentation](tests/README.md)

---

## Features

### Implemented Features
1. **HRV Monitoring**: Real-time HRV tracking and visualization.
2. **Relaxation Exercises**: Mindfulness and breathing exercises with audio guidance.
3. **User Authentication**: Secure login and registration system.
4. **Data Export**: Ability to export HRV data for personal use (PDF).
5. **Tetris**: Tetris game for relaxation and distraction.
6. **Responsive Design**: Optimized for desktop and mobile devices.
7. **User-Friendly Interface**: Intuitive navigation and layout.
8. **Web Bluetooth Support**: Connect to Polar H10 heart rate monitor for real-time data.
9. **Data Visualization**: Interactive charts for HRV data analysis.
10. **Audio Feedback**: Sound effects for user interactions and relaxation exercises.
11. **Theme Toggle**: Light and dark mode support for user preference.
12. **Localization**: Support for multiple languages (English and Finnish).
13. **Mobile Compatibility**: Optimized for mobile devices with touch support.

---

## Libraries and Tools

### Frontend
- **Tailwind CSS**: For styling.
- **Chart.js**: For data visualizations.
- **Lucide Icons**: For icons.
- **Web Bluetooth**: For device connectivity (Polar H10).

### Backend
- **Node.js**: Backend runtime.
- **Express.js**: Web framework.


---


### Known Bugs/Issues
- **Polar H10 Connection**: Does not work on Apple devices due to Safari's requirement for the WebKit API, which does not support Web Bluetooth.

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

## Project Structure

```
    MindMend/
    ├── frontend/
    ├── backend/
    ├── tests/
    ├── .gitignore
    ├── .prettierignore
    ├── .prettierrc.cjs
    ├── eslint.config.js
    └── README.md
```

For more details, refer to the [Frontend README](frontend/README.md) and [Backend README](backend/README.md).
Testing documentation can be found at our [Testing README](tests/README.md)
---

## Database Schema

The database for MindMend. Below is the schema for the `users` and `hrv_readings` tables, represented using Mermaid markup:

````mermaid
erDiagram
    USERS {
        int user_id PK
        string name UNIQUE
        string email UNIQUE
        string password
    }
    HRV_READINGS {
        int hrv_id PK
        int user_id FK
        datetime reading_time
        float hrv_value
    }
    USERS ||--o{ HRV_READINGS : "has many"
````
### Note on Database Simplicity

The database structure of MindMend is intentionally simple, adhering to the "keep it simple" philosophy, which avoids unnecessary complexity while meeting all functional requirements.


## Project initiation instructions

1.  Please follow the frontend initiation instructions in the [Frontend README](frontend/README.md) to set up the frontend.

2.  Please follow the backend initiation instructions in the [Backend README](backend/README.md) to set up the backend.


---

## Testing

### Test User Credentials

| Email             | Password |
|-------------------|----------|
| test123@gmail.com | test123  |

---


