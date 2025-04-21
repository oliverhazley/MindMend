*** Settings ***
Documentation     Login test for MindMend application
Library           Browser
Suite Setup       Setup Browser
Suite Teardown    Close Browser

*** Variables ***
${BASE_URL}       http://localhost:5173    
${LOGIN_URL}      ${BASE_URL}/src/pages/login.html
${DASHBOARD_URL}  ${BASE_URL}/src/pages/dashboard.html

# Olemassa olevan käyttäjän tiedot - 
${EMAIL}          bueno@bueno.com      
${PASSWORD}       asdasd123            

*** Test Cases ***
User Can Access Login Page
    Go To Login Page
    Page Should Contain Login Form

User Can Submit Login Form
    Go To Login Page
    Fill Login Form    ${EMAIL}    ${PASSWORD}
    Submit Login Form
    Sleep    2s
    # Tarkistetaan että lomake on lähetetty
    ${url}=    Get Url
    Log    Current URL after login: ${url}
    # Tässä voisimme tarkistaa, että kirjautumispyyntö on lähetetty backendille

*** Keywords ***
Setup Browser
    New Browser    chromium    headless=False
    New Context    viewport={'width': 1280, 'height': 720}
    New Page

Go To Login Page
    Go To    ${LOGIN_URL}
    Wait For Elements State    h2:text("Log In")    visible    timeout=5s

Page Should Contain Login Form
    Wait For Elements State    input[name="email"]    visible
    Wait For Elements State    input[name="password"]    visible
    Wait For Elements State    button[type="submit"]    visible

Fill Login Form
    [Arguments]    ${email}    ${password}
    Fill Text    input[name="email"]    ${email}
    Fill Text    input[name="password"]    ${password}
    
Submit Login Form
    Click    button[type="submit"]