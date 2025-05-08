<div align="center">
   <h1>MindMend - Test Documentation</h1>
   <img src="../frontend/public/images/mmlogo.webp" alt="MindMend Logo" width="400"/>
</div>

Welcome to the **Testing** documentation of **MindMend**, a mental wellness and PTSD management application designed to help users manage stress and improve mental health through cutting-edge features like HRV monitoring and guided relaxation exercises.

---

## Table of Contents

1.  [Introduction](#introduction)
2.  [Links](#links)
3.  [Test Environment Setup](#test-environment-setup)
    - [1. Change Directory](#1-change-directory)
    - [2. Virtual Environment](#2-virtual-environment)
    - [3. Install Requirements](#3-install-requirements)
    - [4. Test Installation](#4-test-installation)
4.  [Running Tests](#running-tests)
    - [Frontend Tests](#frontend-tests)
    - [Backend API Tests](#backend-api-tests)
5.  [Understanding Test Results](#understanding-test-results)
6.  [Configuration Notes](#configuration-notes)

---

## Introduction

MindMend's automated tests, setup, and execution procedures are used to ensure the quality and reliability of the MindMend application.

## Links

- **Published Frontend Application**: [Mind-mend.live](https://mind-mend.live)
- **Backend API Service**: [Azure](https://mind-mend.azurewebsites.net/api)
- **API Documentation**: [API Documentation](https://users.metropolia.fi/~miskanu/MindMend/docs/)
- **Frontend README**: [Frontend-specific Documentation](../frontend/README.md)
- **Backend README**: [Backend-specific Documentation](../backend/README.md)

---

## Test Environment Setup

Follow these steps to prepare your local environment for running the automated tests.

### 1. Change Directory

Navigate to the `tests` directory from the project root:

```bash
cd tests
```

### 2. Virtual Environment

It's recommended to use a virtual environment to manage dependencies.

**Create the virtual environment (if you haven't already):**

```bash
python -m venv .venv
```

**Activate the virtual environment:**

- **Windows:**
  ```bash
  .venv\Scripts\activate
  ```
- **macOS/Linux:**
  ```bash
  source .venv/bin/activate
  ```

_(Remember to add `.venv` to your `.gitignore` file if it's not already there.)_

### 3. Install Requirements

Install the necessary Python packages using pip:

**Upgrade pip (optional, but recommended):**

```bash
python -m pip install --upgrade pip
```

**Install test dependencies:**

```bash
pip install -r requirements.txt
```

### 4. Test Installation

Verify that Robot Framework and its key libraries are correctly installed:

```bash
python installTest.py
```

You should see output similar to this (versions may vary):

```
Python: 3.12.1 (tags/v3.12.1:2305ca5, Dec  7 2023, 22:03:25) [MSC v.1937 64 bit (AMD64)]
Robot Framework: 7.2.2
Browser: 19.4.0
requests: 2.32.3
CryptoLibrary: 0.4.2
```

---

## Running Tests

The MindMend application has two main suites of automated tests: Frontend and Backend.

### Frontend Tests

These tests verify the user interface and user interaction flows of the MindMend frontend. They are implemented using Robot Framework with the Browser library.

**Purpose:**

- Ensure key user interface elements are present and functional.
- Validate navigation and user workflows (e.g., login, accessing features).
- Check responsiveness and behavior of interactive components.

**Location:** [`tests/frontendTest/`](./frontendTest/)

**How to Run:**

1.  Ensure the MindMend frontend application is running (typically at `http://localhost:5173`).
2.  Ensure the MindMend backend application is running (typically at `http://localhost:3000/api`).
3.  Navigate to the frontend test directory and execute the tests:

    ```bash
    cd frontendTest
    robot frontendTest.robot
    ```

**Key Areas Covered:**

- User login and registration.
- Interaction with HRV monitoring features.
- Chatbot interaction.
- Tetris game functionality.
- Mindfulness and breathing exercises.

**Test Results:**

- **Detailed Log:** [Frontend Test Log](frontendTest/log.html)
- **Summary Report:** [Frontend Test Report](frontendTest/report.html)
- **Raw XML Output:** [Frontend Test Raw XML Output](frontendTest/output.xml)

### Backend API Tests

These tests verify the core functionalities of the MindMend backend API, ensuring data integrity and correct endpoint behavior. They are implemented using Robot Framework with the RequestsLibrary.

**Purpose:**

- Validate API endpoints for user authentication (registration, login).
- Test user data retrieval and management.
- Verify HRV data submission and retrieval logic.

**Location:** [`tests/backendTest/`](./backendTest/)

**Prerequisites:**

1.  **Running Backend Server**: The backend server must be running and accessible at the `BASE_URL` specified in [`backendTest.robot`](backendTest/backendTest.robot) (default: `http://localhost:3000/api`).
2.  **Initial User Account**: Some tests rely on an existing user account for setup (e.g., to obtain an initial authentication token). (`${EXISTING_EMAIL}` and `${PASSWORD}` in `backendTest.robot`) corresponds to a existing valid user in the database.

**How to Run:**

1.  Ensure the MindMend backend application is running.
2.  Navigate to the backend test directory and execute the tests:

    ```bash
    cd backendTest
    robot backendTest.robot
    ```

**Test Cases Overview:**

- **Setup:**
  - `Setup Test Suite`: Logs in an existing user to obtain an authentication token and user ID for subsequent authenticated tests. Generates dynamic data for new user registration.
- **User Authentication:**
  - `Register New User Successfully`: Tests successful creation of a new user.
  - `Register User With Existing Email`: Ensures registration fails if the email already exists.
  - `Login User Successfully`: Tests successful login with valid credentials.
  - `Login User With Incorrect Password`: Ensures login fails with an incorrect password.
- **User Management:**
  - `Get All Users`: Tests retrieving the list of all users (requires authentication).
  - `Delete User Successfully`: Register and login as a new user that is to be deleted.
- **HRV Data:**
  - `Add HRV Reading Successfully`: Tests adding a valid HRV reading.
  - `Add HRV Reading With Invalid Data`: Ensures adding an HRV reading fails with incorrect data.
  - `Get HRV Readings For User`: Tests retrieving HRV readings for a user.
  - `Get HRV Readings Without User ID`: Ensures retrieving HRV readings fails if `user_id` is missing.
- **Chatbot:**
  - `Send Chat Message Successfully`: Sends a message to the chatbot (does not wait for a possible reply).

**Test Results:**

- **Detailed Log:** [Backend Test Log](backendTest/log.html)
- **Summary Report:** [Backend Test Report](backendTest/report.html)
- **Raw XML Output:** [Backend Test Raw XML output](backendTest/output.xml)

---

## Understanding Test Results

After running any test suite, Robot Framework generates the following files in the respective test directory (e.g., `frontendTest/` or `backendTest/`):

- **`log.html`**: A detailed HTML log file showing the execution steps of each test case, keyword statuses, and any messages or errors. This is crucial for debugging failed tests.
- **`report.html`**: An HTML summary report providing an overview of test execution, including pass/fail statistics, execution time, and a summary of test suites and test cases.
- **`output.xml`**: An XML file containing the complete test results in a machine-readable format. This can be used for further processing or integration with CI/CD systems.

---

## Configuration Notes

- The Robot Framework test files (`.robot`) may contain variables (e.g., `${URL}`, `${BASE_URL}`, `${VALID_EMAIL}`, `${VALID_PASSWORD}`) that define test parameters like application URLs or test data.
- If your local development environment differs from the defaults (e.g., your application runs on different ports), you may need to adjust these variables within the respective `.robot` files.
