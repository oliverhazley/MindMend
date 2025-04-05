# Backend structure and documentation

## Folder structure

    backend/
    ├── package.json
    ├── .env
    ├── database/
    │   └── schema.sql
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

3.  Initialize the database

        source <filepath>

    And to make sure it's created correctly run:

        show tables;

    It should look something like this:

        +-----------------------+
        | Tables_in_mindmend    |
        +-----------------------+
        | hrv_readings          |
        | daily_hrv_max         |
        | weekly_hrv_avg        |
        | monthly_hrv_trend     |
        | users                 |
        +-----------------------+

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
