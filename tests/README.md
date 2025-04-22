# Testing documentation

## Test enviroment initialization

Change directory to tests/

```bash
cd tests
```

### 1. Virtual enviroment

Create .venv folder

```bash
python -m venv .venv
```

Activate the virtual enviroment

- Windows

```bash
.venv\Scripts\activate
```

- macOS

```bash
source .venv/bin/activate
```

Add .venv folder to .gitignore.

### 2. Install the requirements and test the installation

Just in case, upgrade pip to the newest version

```bash
python -m pip install --upgrade pip
```

Then install the requirements

```bash
pip install -r requirements.txt
```

After that you should test the installation from your terminal

```bash
python installTest.py
```

Its should print the following:

```bash
Python: 3.12.1 (tags/v3.12.1:2305ca5, Dec  7 2023, 22:03:25) [MSC v.1937 64 bit (AMD64)]
Robot Framework: 7.2.2
Browser: 19.4.0
requests: 2.32.3
CryptoLibrary: 0.4.2
```

Note: Version numbers may vary.

## MindMend Login Test Documentation

This document describes the automated login tests for the MindMend application using Robot Framework.

### Overview

The test suite (`login_test.robot`) verifies the basic login functionality of the MindMend application, including:

- Accessing the login page
- Verifying the login form elements exist
- Submitting login credentials

### Prerequisites

- Python 3.7+
- Robot Framework installed
- Robot Framework Browser library installed
- MindMend frontend running at http://localhost:5173
- MindMend backend service running

### Setup

Ensure the MindMend application is running:

- Start backend: `cd backend && npm run dev`
- Start frontend: `cd frontend && npm run dev`

### Running the Tests

From the tests directory:

```bash
cd tests/logintest
robot login_test.robot
```

### Test Cases

#### User Can Access Login Page

Verifies that the login page loads properly and contains the expected login form elements.

#### User Can Submit Login Form

Verifies that a user can fill in and submit the login form.

### Test Results

After running the tests, you can view the generated reports:

- log.html - Detailed test execution log
- report.html - Test result summary

### Configuration

The test uses the following variables that can be modified if needed:

- `${BASE_URL}` - Base URL of the application
- `${LOGIN_URL}` - URL of the login page
- `${EMAIL}` and `${PASSWORD}` - Test credentials

![pass](https://github.com/user-attachments/assets/c0ec699a-5007-4f45-9051-68aa20162ed5)

![fail](https://github.com/user-attachments/assets/a0f52140-bfa1-4c72-b82a-5bdfe87bfdea)

## Backend API Tests (Robot Framework)

This directory contains automated tests for the MindMend backend API, written using Robot Framework.

[Test report](../tests/backendTest/report.html)

### Purpose

These tests verify the core functionalities of the backend API, including user authentication (registration, login), user data retrieval, and HRV data management (adding, retrieving).

### Prerequisites

1.  **Running Backend Server**: Ensure the backend server is running and accessible at the `BASE_URL` specified in the `backendTest.robot` file (default: `http://localhost:3000/api`).
2.  **Initial User**: The tests assume an existing user account specified by `${LOGIN_EMAIL}` and `${LOGIN_PASSWORD}` in the `*** Variables ***` section of `backendTest.robot` exists in the database for setup purposes (obtaining an initial auth token).

### Running the Tests

Navigate to the `tests/backendTest` directory in your terminal and run the tests using the `robot` command:

```bash
cd path/to/MindMend/tests/backendTest
robot backendTest.robot
```

Test results (log.html, report.html, output.xml) will be generated in the same directory. Link to report.html is at the top.

### Test Cases Overview

#### Setup

- `Setup Test Suite`: Logs in an existing user (`${LOGIN_EMAIL}`) to obtain an authentication token (`${AUTH_TOKEN}`) and user ID (`${USER_ID}`) used by subsequent authenticated tests. Generates random data for new user registration.

#### User Authentication

- `Register New User Successfully`: Tests successful creation of a new user account using dynamically generated data.
- `Register User With Existing Email`: Tests that registration fails if the email already exists.
- `Login User Successfully`: Tests successful login using the predefined `${LOGIN_EMAIL}` and `${LOGIN_PASSWORD}`.
- `Login User With Incorrect Password`: Tests that login fails with an incorrect password.

#### User Management

- `Get All Users`: Tests retrieving the list of all users (requires authentication).

#### HRV Data

- `Add HRV Reading Successfully`: Tests adding a valid HRV reading for the logged-in user (requires authentication).
- `Add HRV Reading With Invalid Data`: Tests that adding an HRV reading fails if the data format is incorrect (requires authentication).
- `Get HRV Readings For User`: Tests retrieving all HRV readings for the logged-in user (requires authentication).
- `Get HRV Readings Without User ID`: Tests that retrieving HRV readings fails if the `user_id` query parameter is missing (requires authentication).

_(Note: A test case for deleting a user is commented out as it requires careful handling to avoid disrupting other tests.)_
