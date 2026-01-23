
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['../test-cases/setupTests.js'],
        include: ['../test-cases/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        alias: {
            '@': path.resolve(__dirname, './src'),
            'react': path.resolve(__dirname, './node_modules/react'),
            'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
            'react-router-dom': path.resolve(__dirname, './node_modules/react-router-dom'),
            '@testing-library/react': path.resolve(__dirname, './node_modules/@testing-library/react'),
            '@testing-library/jest-dom': path.resolve(__dirname, './node_modules/@testing-library/jest-dom'),
        },
    },
    server: {
        fs: {
            allow: ['..'],
        },
    },
});
