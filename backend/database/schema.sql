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

-- Test user with password 'test123'
INSERT INTO users (name, password, email) VALUES
('test', '$2b$10$s5i.C3OaEL9Kk8Em/lmwmONdtkl49D9ZkhyyBEf9jYdaJPCZzVo6i', 'test123@gmail.com')