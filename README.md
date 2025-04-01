# MindMend

## Project initiation instructions

1.  check versions, needs Node version of at least 18

        node --version
        npm --version

2.  Install node modules for front- and backend

    for frontend:

        cd frontend
        npm install

    for backend:

        cd backend
        npm install

## General project structure

    MindMend/
    ├── frontend/
    ├── backend/
    ├── .gitignore
    ├── .prettierignore
    ├── .prettierrc.cjs
    ├── eslint.config.js
    └── README.md

## Detailed structure and documentation for both front- and backend

[Frontend documentation](frontend/README.md)

[Backend documentation](backend/README.md)

## Database

```mermaid
erDiagram
    hrv_readings {
        int id PK "Primary Key"
        int user_id FK "Foreign Key"
        datetime reading_time
        float hrv_value
    }

    daily_hrv_max {
        int id PK "Primary Key"
        int user_id FK "Foreign Key"
        date date
        float max_hrv_value
    }

    weekly_hrv_avg {
        int id PK "Primary Key"
        int user_id FK "Foreign Key"
        date week_start_date
        float avg_max_hrv
    }

    monthly_hrv_trend {
        int id PK "Primary Key"
        int user_id FK "Foreign Key"
        date month_start_date
        float monthly_avg_hrv
    }

    users {
        int id PK "Primary Key"
        varchar name
        varchar email
        varchar password
    }

    users ||--o{ hrv_readings : "has"
    users ||--o{ daily_hrv_max : "has"
    users ||--o{ weekly_hrv_avg : "has"
    users ||--o{ monthly_hrv_trend : "has"
    hrv_readings ||--o{ daily_hrv_max : "aggregated to"
    daily_hrv_max ||--o{ weekly_hrv_avg : "aggregated to"
    weekly_hrv_avg ||--o{ monthly_hrv_trend : "aggregated to"
```

## Refrences and graphics libraries

Icons from [Lucide](https://lucide.dev/)

Sounds from [Freesound](https://freesound.org/)
