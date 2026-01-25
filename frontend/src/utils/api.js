export const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const getHeaders = (isMultipart = false) => {
    let token = null;
    try {
        const authData = JSON.parse(sessionStorage.getItem('migratemate_auth') || localStorage.getItem('migratemate_auth'));
        token = authData?.token;
    } catch (e) {
        console.error("Error parsing auth data for API", e);
    }

    const headers = {
        'Authorization': `Bearer ${token}`
    };

    if (!isMultipart) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
};

export const updateUserProfile = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update profile');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

export const updateUserProfileMultipart = async (formData) => {
    try {
        const response = await fetch(`${API_URL}/users/profile/multipart`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to upload profile picture');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

export const createNotification = async (userId, title, description, color = 'GRAY') => {
    try {
        const response = await fetch(`${API_URL}/notifications`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ userId, title, description, color })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Failed to create notification", data);
            // We usually don't throw here to avoid interrupting the main flow if notification fails
        }
        return data;
    } catch (error) {
        console.error("Error creating notification", error);
    }
};
