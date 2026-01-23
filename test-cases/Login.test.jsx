
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import Login from '../frontend/src/Pages/Login';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Mock auth utils
vi.mock('../frontend/src/utils/auth', () => ({
    setAuthData: vi.fn(),
    setUserData: vi.fn(),
    isAuthenticated: vi.fn().mockReturnValue(false),
    clearAuthData: vi.fn(),
}));

// Mock Navbar
vi.mock('../frontend/src/components/Navbar', () => ({
    default: () => <div data-testid="mock-navbar">Navbar</div>
}));

describe('Login Component', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        global.fetch = vi.fn();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders login form elements', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        // Inputs
        expect(screen.getByPlaceholderText(/your-email@example.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();

        // Button - try getByText if role is tricky
        expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();

        // Header
        expect(screen.getByRole('heading', { level: 2, name: /Welcome Back/i })).toBeInTheDocument();
    });

    it('updates input fields', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        const emailInput = screen.getByPlaceholderText(/your-email@example.com/i);
        const passwordInput = screen.getByPlaceholderText(/••••••••/i);

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });

    it('handles successful login', async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        token: 'mock-token',
                        refreshToken: 'mock-refresh',
                        user: { id: 'u1', email: 'test@example.com' }
                    }
                })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: { id: 'u1', email: 'test@example.com', firstName: 'Test' }
                })
            });

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/your-email@example.com/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'password123' } });

        const submitBtn = screen.getByRole('button', { name: /Sign in/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });
    });

    it('displays error on failed login', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({
                success: false,
                message: 'Invalid email or password'
            })
        });

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/your-email@example.com/i), { target: { value: 'wrong@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'wrongpass' } });

        const submitBtn = screen.getByRole('button', { name: /Sign in/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
        }, { timeout: 2000 });
    });
});
