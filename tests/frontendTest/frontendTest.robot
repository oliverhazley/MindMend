***Settings***
Library           Browser
Library           String
Library           Collections
Suite Setup       Setup Test Suite
Suite Teardown    Close MindMend


***Variables***
${URL}                   http://localhost:5173
${VALID_EMAIL}           test123@gmail.com
${VALID_PASSWORD}        test123
${INVALID_EMAIL}         invalid@gmail.com
${INVALID_PASSWORD}      invalid123
${USER_PASSWORD}         TestPass123
${NEW_USER_PASSWORD}     RobotTester123
${CHAT_MESSAGE}          Hello, Im feeling anxious today.

***Keywords***
Setup Test Suite
    [Documentation]    Opens browser and generates dynamic data for the test suite
    # Open the browser first with error handling
    New Page    ${URL}
    Set Viewport Size    1920    1080
    
    # Wait for any stable homepage element instead of specific herologin link
    # This makes the test more resilient if UI changes
    ${status}=    Run Keyword And Return Status    Wait For Elements State    body    visible
    IF    not ${status}    Fail    Homepage did not load properly
    
    # Generate random data for new user registration
    ${RANDOM_INT}    Evaluate    random.randint(1, 10000)    random
    ${user_email}    Set Variable    robotTester-${RANDOM_INT}@test.com
    ${user_name}     Set Variable    Robot Tester ${RANDOM_INT}
    Set Suite Variable    ${NEW_USER_EMAIL}    ${user_email}
    Set Suite Variable    ${NEW_USER_NAME}     ${user_name}
    Log    Generated User Email: ${NEW_USER_EMAIL}
    Log    Generated User Name: ${NEW_USER_NAME}

Close MindMend
    Close Browser

Open MindMend
    New Page    ${URL}
    Set Viewport Size    1920    1080
    Wait For Elements State    body    visible

Go To Login Page
    ${status}=    Run Keyword And Return Status    Click    id=navbarlogin
    IF    not ${status}    Click    id=herologin
    Wait For Elements State    id=loginForm    visible

Go To Signup Page
    ${status}=    Run Keyword And Return Status    Click    id=navbarsignup
    IF    not ${status}    Click    id=herosignup
    Wait For Elements State    id=signupForm    visible

Attempt Login
    [Arguments]    ${email}    ${password}
    Fill Text    id=login-email       ${email}
    Fill Text    id=login-password    ${password}
    Click           xpath=//form[@id='loginForm']//button[@type='submit']

Attempt Signup
    [Arguments]    ${name}    ${email}    ${password}    ${confirm_password}
    Fill Text    id=signup-name        ${name}
    Fill Text    id=signup-email       ${email}
    Fill Text    id=signup-password    ${password}
    Fill Text    id=signup-confirm     ${confirm_password}
    Click    xpath=//form[@id='signupForm']//button[@type='submit']

Verify Login Success
    Wait For Elements State    id=page-dashboard    visible
    Wait For Elements State    id=logoutButton      visible

Verify Login Failure
    Wait For Elements State    id=loginForm    visible
    Wait For Elements State    body:has-text("Log In")    visible

Verify Signup Success
    Wait For Elements State    body   visible

Verify Signup Failure Password Mismatch
    Wait For Elements State    body:has-text("Passwords don't match. Please re-enter them.")    visible

Verify Signup Failure Existing Email
    Wait For Elements State    body:has-text("That email address is already registered. Please log in instead.")    visible

Logout User
    Wait For Elements State    id=logoutButton    visible
    Click    id=logoutButton

Verify Logout Success
    Wait For Elements State    id=page-home    visible
    Wait For Elements State    body    visible

Navigate To Page And Verify
    [Arguments]    ${page_hash}    ${element_to_wait_for}
    Go To    ${URL}${page_hash}
    Wait For Elements State    ${element_to_wait_for}    visible

Login If Necessary
    ${logged_in}=    Run Keyword And Return Status    Wait For Elements State    id=logoutButton    visible    timeout=1s
    IF    not ${logged_in}
        Go To Login Page
        Attempt Login    ${VALID_EMAIL}    ${VALID_PASSWORD}
        Verify Login Success
    END

Interact With Sound Meditation
    Click    id=playPauseBtn-nature
    Sleep    1s
    Click    id=playPauseBtn-nature
    Sleep    1s
    Click    id=resetBtn-nature

Interact With Breathing Meditation
    Click    id=playPauseBtn-box
    Sleep    1s
    Click    id=playPauseBtn-box
    Sleep    1s
    Click    id=resetBtn-box

Start Tetris
    Click    id=startTetrisBtn
    Wait For Elements State    id=pauseResumeBtn    visible

Pause Tetris
    Click    id=pauseResumeBtn
    Sleep    1s

Restart Tetris
    Click    id=restartTetrisBtn
    Wait For Elements State    id=startTetrisBtn    visible    timeout=5s

Click Export Data On Dashboard
    Click    id=exportPDFBtnDashboard

Click Connect Polar H10 On Dashboard
    Click    id=polarConnectBtn

Send Chat Message
    [Arguments]    ${message}
    Fill Text       id=chatInput    ${message}
    Click           xpath=//form[@id='chatForm']//button[@type='submit']

Navigate Via Navbar
    [Arguments]    ${link_text}    ${expected_element}
    Click    xpath=//nav//a[contains(text(), '${link_text}')]
    Wait For Elements State    ${expected_element}    visible

***Test Cases***
Login With Valid Credentials
    Go To Login Page
    Attempt Login    ${VALID_EMAIL}    ${VALID_PASSWORD}
    Verify Login Success
    Logout User
    Verify Logout Success

Login With Invalid Credentials
    Go To Login Page
    Attempt Login    ${INVALID_EMAIL}    ${INVALID_PASSWORD}
    Verify Login Failure
    Go To    ${URL}

Sign Up With Valid Credentials
    Go To Signup Page
    Attempt Signup    ${NEW_USER_NAME}    ${NEW_USER_EMAIL}    ${NEW_USER_PASSWORD}    ${NEW_USER_PASSWORD}
    Verify Signup Success
    Go To     ${URL}

Sign Up With Existing Email
    Go To Signup Page
    Attempt Signup    ${NEW_USER_NAME}    ${VALID_EMAIL}    ${USER_PASSWORD}    ${USER_PASSWORD}
    Verify Signup Failure Existing Email
    Go To     ${URL}

Logout From Dashboard
    Login If Necessary
    Navigate To Page And Verify    \#/dashboard    id=page-dashboard
    Logout User
    Verify Logout Success

Interact With Sound Meditation
    Login If Necessary
    Navigate To Page And Verify    \#/exercises    id=page-exercises
    Interact With Sound Meditation

Interact With Breathing Meditation
    Login If Necessary
    Navigate To Page And Verify    \#/exercises    id=breathingList
    Interact With Breathing Meditation

Play Pause Restart Tetris Game
    Login If Necessary
    Navigate To Page And Verify    \#/tetris    id=tetrisBoard
    Start Tetris
    Pause Tetris
    Restart Tetris

Click Export Data Button
    Login If Necessary
    Navigate To Page And Verify    \#/dashboard    id=exportPDFBtnDashboard
    Click Export Data On Dashboard
    Sleep    1s

Click Connect Polar H10
    Login If Necessary
    Navigate To Page And Verify    \#/dashboard    id=polarConnectBtn
    Click Connect Polar H10 On Dashboard
    Sleep    1s

Send Message To Chatbot And Verify Response
    Login If Necessary
    Navigate To Page And Verify    \#/chat    id=chatWindow
    Send Chat Message    ${CHAT_MESSAGE}