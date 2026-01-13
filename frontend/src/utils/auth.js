/**
 * Auth Utility to manage storage (Session vs Local) and Token management
 */

const STORAGE_KEY_PREFIX = 'migratemate_';
const EXPIRATION_DAYS = 3;

export const setAuthData = (data, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    // Clear data from the other storage to ensure strict separation
    otherStorage.removeItem(`${STORAGE_KEY_PREFIX}auth`);
    otherStorage.removeItem('userData');
    if (!rememberMe) {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}auth`);
        localStorage.removeItem('userData');
    } else {
        sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}auth`);
        sessionStorage.removeItem('userData');
    }

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
    // Find active storage based on where auth data is
    let storage = sessionStorage;
    const localAuth = localStorage.getItem(`${STORAGE_KEY_PREFIX}auth`);

    if (localAuth) {
        storage = localStorage;
    }

    storage.setItem('userData', JSON.stringify(userData));
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
    let userString = sessionStorage.getItem('userData');
    if (!userString) {
        userString = localStorage.getItem('userData');
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

    if (authData) {
        // Sync authorized flag for session
        if (!sessionStorage.getItem('authorized')) {
            sessionStorage.setItem('authorized', 'true');
        }
        return true;
    }
    return false;
};

export const clearAuthData = () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}auth`);
    localStorage.removeItem('userData');
    sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}auth`);
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('authorized');
};
