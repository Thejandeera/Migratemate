
import { API_URL as BASE_URL } from './api';

const getHeaders = () => {
    let token = null;
    try {
        const authData = JSON.parse(sessionStorage.getItem('migratemate_auth') || localStorage.getItem('migratemate_auth'));
        token = authData?.token;
    } catch (e) {
        console.error("Error parsing auth data for API", e);
    }
    
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const createBooking = async (bookingData) => {
    try {
        const response = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(bookingData)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to create booking');
        return data;
    } catch (error) {
        throw error;
    }
};

export const getMyBookings = async () => {
    try {
        const response = await fetch(`${BASE_URL}/bookings/my-bookings`, {
            headers: getHeaders()
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch bookings');
        return data.data; // Assuming API returns { success: true, data: [...] }
    } catch (error) {
        throw error;
    }
};

export const getProviderBookings = async () => {
    try {
        const response = await fetch(`${BASE_URL}/bookings/provider-requests`, {
            headers: getHeaders()
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch provider requests');
        return data.data;
    } catch (error) {
        throw error;
    }
};

export const updateBookingStatus = async (bookingId, status) => {
    try {
        const response = await fetch(`${BASE_URL}/bookings/${bookingId}/status`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ status })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update status');
        return data.data;
    } catch (error) {
        throw error;
    }
};
