*** Settings ***
Library    RequestsLibrary
Library    Collections
Library    String
Suite Setup    Setup Test Suite

*** Variables ***
${BASE_URL}    http://localhost:3000/api
${USER_PASSWORD}    testi123
${LOGIN_EMAIL}   testi@gmail.com    # Existing user for login/setup
${LOGIN_PASSWORD}    testi123

*** Keywords ***
Setup Test Suite
    [Documentation]    Generates dynamic data and logs in a user for the suite.
    # Generate random data for the new user registration test
    ${RANDOM_INT}    Evaluate    random.randint(1, 10000)    random
    ${user_email}    Set Variable    testi-${RANDOM_INT}.user@example.com
    ${user_name}     Set Variable    Test User ${RANDOM_INT}
    Set Suite Variable    ${USER_EMAIL}    ${user_email}
    Set Suite Variable    ${USER_NAME}     ${user_name}
    Log    Generated User Email: ${USER_EMAIL}
    Log    Generated User Name: ${USER_NAME}

    # Login as existing user to get auth token
    Login as regular existing user

Login as regular existing user
    [Documentation]    Login as a regular user to get the token and user ID for authentication.
    ${body}    Create Dictionary    email=${LOGIN_EMAIL}    password=${LOGIN_PASSWORD}
    ${response}    POST    url=${BASE_URL}/users/auth/login    json=${body}
    Log    ${response.json()}
    Should Be Equal As Strings    ${response.status_code}    200
    ${token}    Set Variable    ${response.json()}[token]
    ${user_id}  Set Variable    ${response.json()}[user][userId]
    Log    Token: ${token}
    Log    User ID: ${user_id}
    Set Suite Variable    ${AUTH_TOKEN}    Bearer ${token}
    Set Suite Variable    ${USER_ID}       ${user_id}
    ${headers}    Create Dictionary    Authorization=${AUTH_TOKEN}
    Set Suite Variable    ${AUTH_HEADERS}    ${headers}

*** Test Cases ***
Register New User Successfully
    [Documentation]    Test registering a new user.
    ${body}    Create Dictionary    name=${USER_NAME}    email=${USER_EMAIL}    password=${USER_PASSWORD}
    ${response}    POST    url=${BASE_URL}/users/auth/register    json=${body}
    ${json}    Set Variable    ${response.json()}
    Dictionary Should Contain Key    ${json}    message
    Dictionary Should Contain Key    ${json}[user]    userId
    Should Be Equal As Strings    ${json}[message]    User registered successfully

Register User With Existing Email
    [Documentation]    Test registering a user with an email that already exists.
    ${body}    Create Dictionary    name=Duplicate User    email=${LOGIN_EMAIL}    password=anotherpass
    ${response}    POST    url=${BASE_URL}/users/auth/register    json=${body}    expected_status=400
    ${json}    Set Variable    ${response.json()}
    Dictionary Should Contain Key    ${json}    message
    Should Be Equal As Strings    ${json}[message]    User with this email already exists

Login User Successfully
    [Documentation]    Test logging in with correct credentials.
    ${body}    Create Dictionary    email=${LOGIN_EMAIL}    password=${LOGIN_PASSWORD}
    ${response}    POST    url=${BASE_URL}/users/auth/login    json=${body}
    Status Should Be    200
    ${json}    Set Variable    ${response.json()}
    Dictionary Should Contain Key    ${json}    token
    Dictionary Should Contain Key    ${json}    message
    Dictionary Should Contain Key    ${json}    user
    Dictionary Should Contain Key    ${json}[user]    userId
    Dictionary Should Contain Key    ${json}[user]    name
    Dictionary Should Contain Key    ${json}[user]    email
    Should Be Equal As Strings    ${json}[message]    Login successful

Login User With Incorrect Password
    [Documentation]    Test logging in with incorrect password.
    ${body}    Create Dictionary    email=${LOGIN_EMAIL}    password=wrongpassword
    ${response}    POST    url=${BASE_URL}/users/auth/login    json=${body}    expected_status=401
    ${json}    Set Variable    ${response.json()}
    Dictionary Should Contain Key    ${json}    message
    Should Be Equal As Strings    ${json}[message]    Invalid email or password

Get All Users
    [Documentation]    Test case to get all users (requires auth).
    ${response}    GET    url=${BASE_URL}/users    headers=${AUTH_HEADERS}
    Status Should Be    200
    Log List    ${response.json()}
    ${users}    Set Variable    ${response.json()}
    Should Be True    len(${users}) > 0  # Assuming at least the logged-in user exists

Add HRV Reading Successfully
    [Documentation]    Test adding a valid HRV reading for the logged-in user.
    ${hrv_value}    Evaluate    random.uniform(30.0, 90.0)    random
    ${body}    Create Dictionary    user_id=${USER_ID}    hrv_value=${hrv_value}
    ${response}    POST    url=${BASE_URL}/hrv    json=${body}    headers=${AUTH_HEADERS}    # Assuming POST /hrv also needs auth implicitly
    Status Should Be    200    # Controller returns 200 on success, not 201
    ${json}    Set Variable    ${response.json()}
    Dictionary Should Contain Key    ${json}    message
    Dictionary Should Contain Key    ${json}    hrv_id
    Should Be Equal As Strings    ${json}[message]    HRV reading stored

Add HRV Reading With Invalid Data
    [Documentation]    Test adding an HRV reading with invalid data.
    ${body}    Create Dictionary    user_id=${USER_ID}    hrv_value=invalid_value
    ${response}    POST    url=${BASE_URL}/hrv    json=${body}    headers=${AUTH_HEADERS}    expected_status=400
    ${json}    Set Variable    ${response.json()}
    Dictionary Should Contain Key    ${json}    message
    Should Be Equal As Strings    ${json}[message]    Invalid input: user_id and hrv_value required

Get HRV Readings For User
    [Documentation]    Test retrieving HRV readings for the logged-in user.
    # Add a reading first to ensure there's data
    ${hrv_value}    Evaluate    random.uniform(30.0, 90.0)    random
    ${body}    Create Dictionary    user_id=${USER_ID}    hrv_value=${hrv_value}
    POST    url=${BASE_URL}/hrv    json=${body}    headers=${AUTH_HEADERS}

    # Now get the readings
    ${response}    GET    url=${BASE_URL}/hrv?user_id=${USER_ID}    headers=${AUTH_HEADERS}
    Status Should Be    200
    Log List    ${response.json()}
    ${readings}    Set Variable    ${response.json()}
    Should Be True    len(${readings}) >= 1
    # Check structure of the first reading (if any)
    IF    len(${readings}) > 0
        Dictionary Should Contain Key    ${readings[0]}    reading_time
        Dictionary Should Contain Key    ${readings[0]}    hrv_value
    END

Get HRV Readings Without User ID
    [Documentation]    Test retrieving HRV readings without providing a user_id.
    ${response}    GET    url=${BASE_URL}/hrv    headers=${AUTH_HEADERS}    expected_status=400
    ${json}    Set Variable    ${response.json()}
    Dictionary Should Contain Key    ${json}    message
    Should Be Equal As Strings    ${json}[message]    Missing user_id in query

# TODO: Delete User Test Case - Requires careful setup/teardown or dedicated test user
# Delete Logged In User
#     [Documentation]    Test deleting the currently logged-in user.
#     # This test might fail subsequent tests if run in the same suite without re-login
#     ${response}    DELETE    url=${BASE_URL}/users    headers=${AUTH_HEADERS} # Assumes DELETE /users deletes the authenticated user
#     Status Should Be    200 # Or 204 No Content
#     # Optionally verify the response message if applicable