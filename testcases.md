# Test Cases Documentation

This document explains the purpose and coverage of the test cases located in the `test-cases/` directory.

## 1. Authentication Utilities (`test-cases/auth.test.js`)
These tests verify the logic in `frontend/src/utils/auth.js`, which handles user session management.

- **should set auth data in session storage**: Checks if the user's token and ID are correctly saved to the browser's temporary session storage when logging in.
- **should set auth data in local storage when rememberMe is true**: Verifies that if a user checks "Remember Me", their data is saved to long-term local storage.
- **should retrieve auth data correctly**: Confirms that the app can successfully read back the saved login information.
- **should return isAuthenticated true when data exists**: Ensures the app correctly identifies a logged-in user.
- **should clear auth data**: Verifies that logging out removes all user data from storage.

## 2. Login Page (`test-cases/Login.test.jsx`)
These tests verify the user interface and behavior of the Login screen (`frontend/src/Pages/Login.jsx`).

- **renders login form elements**: Checks if the email input, password input, and "Sign in" button are visible on the screen.
- **updates input fields**: Verifies that when a user types into the email and password boxes, the values actually change.
- **handles successful login**: Simulates a successful server response and checks if the login function is called with the correct credentials.
- **displays error on failed login**: Simulates a failed login (e.g., wrong password) and checks if an error message ("Invalid email or password") appears on the screen.

## 3. General App (`test-cases/example.test.jsx`)
This is a basic "smoke test" to ensure the application starts up correctly.

- **renders the App component**: Tries to render the main `<App />` component to ensure there are no crashing errors locally or in configuration.
- **true is true**: A simple sanity check to ensure the test runner itself is working.
