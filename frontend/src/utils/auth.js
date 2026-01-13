
const STORAGE_KEY_PREFIX = 'migratemate_';
const EXPIRATION_DAYS = 3;


export const setAuthData = (data, rememberMe) => {
    const timestamp = new Date().getTime();


    const authPayload = {
        token: data.token,
        refreshToken: data.refreshToken,
        id: data.id,
        timestamp: timestamp,
        rememberMe: rememberMe
    };

    const authString = JSON.stringify(authPayload);


    sessionStorage.setItem(`${STORAGE_KEY_PREFIX}auth`, authString);
    sessionStorage.setItem('authorized', 'true');

    if (rememberMe) {

        localStorage.setItem(`${STORAGE_KEY_PREFIX}auth`, authString);
    } else {

        localStorage.removeItem(`${STORAGE_KEY_PREFIX}auth`);
        localStorage.removeItem('userData');
    }
};


export const setUserData = (userData) => {
    const userString = JSON.stringify(userData);


    sessionStorage.setItem('userData', userString);


    if (localStorage.getItem(`${STORAGE_KEY_PREFIX}auth`)) {
        localStorage.setItem('userData', userString);
    }
};


export const getAuthData = () => {

    const sessionAuth = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}auth`);
    if (sessionAuth) {
        return JSON.parse(sessionAuth);
    }


    const localAuth = localStorage.getItem(`${STORAGE_KEY_PREFIX}auth`);
    if (localAuth) {
        try {
            const authData = JSON.parse(localAuth);


            const now = new Date().getTime();
            const daysDiff = (now - authData.timestamp) / (1000 * 3600 * 24);

            if (daysDiff > EXPIRATION_DAYS) {
                clearAuthData();
                return null;
            }


            restoreSession(localAuth);

            return authData;
        } catch (e) {
            console.error("Error parsing local auth data", e);
            return null;
        }
    }

    return null;
};


const restoreSession = (authString) => {

    sessionStorage.setItem(`${STORAGE_KEY_PREFIX}auth`, authString);
    sessionStorage.setItem('authorized', 'true');


    const localUser = localStorage.getItem('userData');
    if (localUser) {
        sessionStorage.setItem('userData', localUser);
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
