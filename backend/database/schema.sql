DROP DATABASE IF EXISTS mindmend;
CREATE DATABASE mindmend;
USE mindmend;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE hrv_readings (
    hrv_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reading_time DATETIME NOT NULL,
    hrv_value FLOAT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE daily_hrv_max (
    daily_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    max_hrv_value FLOAT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE weekly_hrv_avg (
    weekly_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    week_start_date DATE NOT NULL,
    avg_max_avg FLOAT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE monthly_hrv_trend (
    monthly_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    month_start_date DATE NOT NULL,
    monthly_avg_hrv FLOAT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);