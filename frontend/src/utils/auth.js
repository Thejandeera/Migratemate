/**
 * Auth Utility to manage storage (Session vs Local) and Token management
 */

const STORAGE_KEY_PREFIX = 'migratemate_';
const EXPIRATION_DAYS = 3;

export const setAuthData = (data, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    const timestamp = new Date().getTime();

    // Store core auth data
    const authPayload = {
        token: data.token,
        refreshToken: data.refreshToken,
        id: data.id,
        timestamp: timestamp,
        rememberMe: rememberMe
    };

    storage.setItem(`${STORAGE_KEY_PREFIX}auth`, JSON.stringify(authPayload));

    // Explicitly set authorized flag in session storage as requested
    sessionStorage.setItem('authorized', 'true');
};

export const setUserData = (userData) => {
    // We need to know where the auth data is to store user data in the same place
    // OR we can just check where the auth data exists.
    // For simplicity, let's try to find active storage or default to session.

    let storage = sessionStorage;
    const localAuth = localStorage.getItem(`${STORAGE_KEY_PREFIX}auth`);
    if (localAuth) {
        storage = localStorage;
    }

    storage.setItem(`${STORAGE_KEY_PREFIX}user`, JSON.stringify(userData));
};

export const getAuthData = () => {
    // Check Session first
    let authString = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}auth`);
    let fromLocal = false;

    // If not in session, check Local (Remember Me)
    if (!authString) {
        authString = localStorage.getItem(`${STORAGE_KEY_PREFIX}auth`);
        fromLocal = true;
    }

    if (!authString) return null;

    try {
        const authData = JSON.parse(authString);

        // Check Expiration if from LocalStorage
        if (fromLocal && authData.timestamp) {
            const now = new Date().getTime();
            const daysDiff = (now - authData.timestamp) / (1000 * 3600 * 24);
            if (daysDiff > EXPIRATION_DAYS) {
                clearAuthData();
                return null;
            }
        }

        return authData;
    } catch (e) {
        return null;
    }
};

export const getUserData = () => {
    let userString = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}user`);
    if (!userString) {
        userString = localStorage.getItem(`${STORAGE_KEY_PREFIX}user`);
    }

    if (!userString) return {};

    try {
        return JSON.parse(userString);
    } catch (e) {
        return {};
    }
};

export const isAuthenticated = () => {
    const authData = getAuthData();
    // Also check the specific 'authorized' flag in session if required, 
    // but the presence of valid token is usually enough. 
    // However, user requested 'authorized' in session storage.
    // Let's ensure if we have valid Auth Data from local, we sync the session flag.

    if (authData) {
        if (!sessionStorage.getItem('authorized')) {
            sessionStorage.setItem('authorized', 'true');
        }
        return true;
    }
    return false;
};

export const clearAuthData = () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}auth`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}user`);
    sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}auth`);
    sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}user`);
    sessionStorage.removeItem('authorized');
};
