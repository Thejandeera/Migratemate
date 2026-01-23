
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setAuthData, getAuthData, isAuthenticated, clearAuthData } from '../frontend/src/utils/auth';

describe('Auth Utils', () => {
    beforeEach(() => {
        // Clear mocks and storage before each test
        vi.clearAllMocks();
        localStorage.clear();
        sessionStorage.clear();
    });

    it('should set auth data in session storage', () => {
        const mockData = { token: 'abc', refreshToken: 'def', id: '123' };
        setAuthData(mockData, false);

        const storedData = sessionStorage.getItem('migratemate_auth');
        expect(storedData).not.toBeNull();
        const parsed = JSON.parse(storedData);
        expect(parsed.token).toBe('abc');
        expect(parsed.id).toBe('123');
        expect(sessionStorage.getItem('authorized')).toBe('true');
    });

    it('should set auth data in local storage when rememberMe is true', () => {
        const mockData = { token: 'abc', refreshToken: 'def', id: '123' };
        setAuthData(mockData, true);

        const storedData = localStorage.getItem('migratemate_auth');
        expect(storedData).not.toBeNull();
        const parsed = JSON.parse(storedData);
        expect(parsed.token).toBe('abc');
    });

    it('should retrieve auth data correctly', () => {
        const mockData = { token: 'abc', refreshToken: 'def', id: '123' };
        setAuthData(mockData, false);

        const retrieved = getAuthData();
        expect(retrieved.token).toBe('abc');
    });

    it('should return isAuthenticated true when data exists', () => {
        const mockData = { token: 'abc', refreshToken: 'def', id: '123' };
        setAuthData(mockData, false);

        expect(isAuthenticated()).toBe(true);
    });

    it('should clear auth data', () => {
        const mockData = { token: 'abc', refreshToken: 'def', id: '123' };
        setAuthData(mockData, true);

        clearAuthData();

        expect(localStorage.getItem('migratemate_auth')).toBeNull();
        expect(sessionStorage.getItem('migratemate_auth')).toBeNull();
        expect(isAuthenticated()).toBe(false);
    });
});
