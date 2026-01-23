import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../frontend/src/App';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

describe('Frontend App', () => {
    it('renders the App component', () => {
        render(
            <BrowserRouter>
                <App />
            </BrowserRouter>
        );
        expect(document.body).toBeDefined();
    });

    it('true is true', () => {
        expect(true).toBe(true);
    });
});
