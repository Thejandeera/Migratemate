import { API_URL } from './api';

/**
 * Service API functions for MarketPlace
 * Uses the backend ServiceManagement module endpoints
 */

// Get all active services (public endpoint)
export const getAllServices = async () => {
    try {
        const response = await fetch(`${API_URL}/services`);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to fetch services');
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching services:', error);
        throw error;
    }
};

// Get service by ID (public endpoint)
export const getServiceById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/services/${id}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Service not found');
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching service:', error);
        throw error;
    }
};

// Get services by category (public endpoint)
export const getServicesByCategory = async (category) => {
    try {
        const response = await fetch(`${API_URL}/services/category/${category}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to fetch services by category');
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching services by category:', error);
        throw error;
    }
};

/**
 * Search services with filters (public endpoint)
 * @param {Object} filters - Search filters
 * @param {string} [filters.category] - Filter by category (TRANSPORT, HOUSING, DOCUMENTATION, CULTURAL_SUPPORT)
 * @param {string} [filters.origin] - Filter by origin country
 * @param {string} [filters.destination] - Filter by destination
 * @param {number} [filters.minPrice] - Minimum price
 * @param {number} [filters.maxPrice] - Maximum price
 * @param {string} [filters.searchTerm] - Keyword search in title/description
 * @param {string} [filters.pricingType] - FIXED, HOURLY, or NEGOTIABLE
 * @param {boolean} [filters.availableOnly] - Show only available services
 */
export const searchServices = async (filters = {}) => {
    try {
        // Build query string from non-null filters
        const params = new URLSearchParams();

        if (filters.category) params.append('category', filters.category);
        if (filters.origin) params.append('origin', filters.origin);
        if (filters.destination) params.append('destination', filters.destination);
        if (filters.minPrice !== undefined && filters.minPrice !== null) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice !== undefined && filters.maxPrice !== null) params.append('maxPrice', filters.maxPrice);
        if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
        if (filters.pricingType) params.append('pricingType', filters.pricingType);
        if (filters.availableOnly !== undefined && filters.availableOnly !== null) params.append('availableOnly', filters.availableOnly);

        const queryString = params.toString();
        const url = queryString ? `${API_URL}/services/search?${queryString}` : `${API_URL}/services/search`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Search failed');
        }

        return data.data;
    } catch (error) {
        console.error('Error searching services:', error);
        throw error;
    }
};

// Get services created by the authenticated user (requires auth)
export const getMyServices = async () => {
    try {
        // Get token from auth storage (matching pattern from api.js)
        let token = null;
        try {
            const authData = JSON.parse(sessionStorage.getItem('migratemate_auth') || localStorage.getItem('migratemate_auth'));
            token = authData?.token;
        } catch (e) {
            console.error("Error parsing auth data", e);
        }

        if (!token) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`${API_URL}/services/my-services`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to fetch your services');
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching my services:', error);
        throw error;
    }
};
