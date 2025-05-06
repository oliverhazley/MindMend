*** Settings ***
Library    RequestsLibrary
Library    Collections
Library    String
Suite Setup    Setup Test Suite

*** Variables ***
${BASE_URL}    http://localhost:3000/api
${PASSWORD}    test123
${EXISTING_EMAIL}   test123@gmail.com

*** Keywords ***
Setup Test Suite
    [Documentation]    Generates dynamic data and logs in a user for the suite.
    # Generate random data for the new user registration test
    ${RANDOM_INT}    Evaluate    random.randint(1, 10000)    random
    ${user_email}    Set Variable    testi-${RANDOM_INT}.user@example.com
    ${user_name}     Set Variable    Test User ${RANDOM_INT}
    Set Suite Variable    ${NEW_USER_EMAIL}    ${user_email}
    Set Suite Variable    ${NEW_USER_NAME}     ${user_name}
    Log    Generated User Email: ${USER_EMAIL}
    Log    Generated User Name: ${USER_NAME}

    # Login as existing user to get auth token
    Login as regular existing user

Login as regular existing user
    [Documentation]    Login as a regular user to get the token and user ID for authentication.
    ${body}    Create Dictionary    email=${EXISTING_EMAIL}    password=${PASSWORD}
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
    ${body}    Create Dictionary    name=${NEW_USER_NAME}    email=${NEW_USER_EMAIL}    password=${PASSWORD}
    ${response}    POST    url=${BASE_URL}/users/auth/register    json=${body}
    ${json}    Set Variable    ${response.json()}
    Dictionary Should Contain Key    ${json}    message
    Dictionary Should Contain Key    ${json}[user]    userId
    Should Be Equal As Strings    ${json}[message]    User registered successfully

Register User With Existing Email
    [Documentation]    Test registering a user with an email that already exists.
    ${body}    Create Dictionary    name=Duplicate User    email=${EXISTING_EMAIL}    password=anotherpass
    ${response}    POST    url=${BASE_URL}/users/auth/register    json=${body}    expected_status=400
    ${json}    Set Variable    ${response.json()}
    Dictionary Should Contain Key    ${json}    message
    Should Be Equal As Strings    ${json}[message]    User with this email already exists

Login User Successfully
    [Documentation]    Test logging in with correct credentials.
    ${body}    Create Dictionary    email=${EXISTING_EMAIL}    password=${PASSWORD}
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
    ${body}    Create Dictionary    email=${EXISTING_EMAIL}    password=wrongpassword
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

Delete User Successfully
    [Documentation]    Register a fresh user, log in as them, then delete and verify.
    # generate a unique user for this test
    ${randInt}    Evaluate    random.randint(10001,20000)    random
    ${del_email}    Set Variable    delete-${randInt}.user@example.com
    ${del_name}     Set Variable    Delete User ${randInt}

    # register that user
    ${body}    Create Dictionary    name=${del_name}    email=${del_email}    password=${PASSWORD}
    ${reg_resp}    POST    url=${BASE_URL}/users/auth/register    json=${body}
    Status Should Be    201
    ${new_id}    Set Variable    ${reg_resp.json()}[user][userId]

    # login
    ${login_body}    Create Dictionary    email=${del_email}    password=${PASSWORD}
    ${login_resp}    POST    url=${BASE_URL}/users/auth/login    json=${login_body}
    Status Should Be    200
    ${new_token}    Set Variable    Bearer ${login_resp.json()}[token]
    ${new_headers}    Create Dictionary    Authorization=${new_token}

    # delete
    ${del_resp}    DELETE    url=${BASE_URL}/users/auth/delete/${new_id}    headers=${new_headers}
    Status Should Be    200
    ${del_json}    Set Variable    ${del_resp.json()}
    Dictionary Should Contain Key    ${del_json}    message
    Should Be Equal As Strings    ${del_json}[message]    User deleted successfully

Send Chat Message Successfully
    [Documentation]    Send a chat message and verify the API acknowledges it.
    ${text}    Set Variable    Hello, Im feeling anxious today.
    ${chat_body}    Create Dictionary    user_id=${USER_ID}    message=${text}
    ${chat_resp}    POST    url=${BASE_URL}/chat    json=${chat_body}    headers=${AUTH_HEADERS}
    Status Should Be    200
    ${chat_json}    Set Variable    ${chat_resp.json()}
    Dictionary Should Contain Key    ${chat_json}    reply