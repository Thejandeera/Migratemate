import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { clearAuthData, isAuthenticated } from '../utils/auth';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        const checkAuth = () => {
            setIsLoggedIn(isAuthenticated());
        };

        checkAuth();
        document.addEventListener('scroll', handleScroll);

        return () => {
            document.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled, location]);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    const handleLogout = () => {
        clearAuthData();
        setIsLoggedIn(false);
        navigate('/');
    }

    // Hide navbar on login page if desired, but user didn't ask to hide it. 
    // Usually admin panels have a simpler login page without the main nav, 
    // but the request implies "navbar ... in dashboard".
    // I will include it everywhere but ensure it is fixed.

    return (
        <nav
            className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 bg-white border-b border-gray-200 shadow-sm`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    <Link to="/dashboard" className="flex items-center gap-2 z-50">
                        <div className="bg-[#22C55E] p-2 rounded-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-gray-800">
                            MigrateMate Admin
                        </span>
                    </Link>

                    {isLoggedIn && (
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/users" className="text-sm font-medium text-gray-500 hover:text-gray-900">View Users</Link>
                            <Link to="/reports" className="text-sm font-medium text-gray-500 hover:text-gray-900">Reports</Link>
                            <Link to="/settings" className="text-sm font-medium text-gray-500 hover:text-gray-900">Settings</Link>
                            <Link to="/logs" className="text-sm font-medium text-gray-500 hover:text-gray-900">Logs</Link>
                            <Link to="/notifications" className="text-sm font-medium text-gray-500 hover:text-gray-900">Notifications</Link>
                        </div>
                    )}

                    <div className="hidden md:flex items-center gap-4">
                        {isLoggedIn ? (
                            <button onClick={handleLogout} className="px-4 py-2 bg-[#22C55E] text-white rounded-lg text-sm font-semibold hover:bg-[#16A34A] transition">
                                Sign Out
                            </button>
                        ) : (
                            <Link to="/" className="px-4 py-2 bg-[#22C55E] text-white rounded-lg text-sm font-semibold hover:bg-[#16A34A] transition">
                                Sign In
                            </Link>
                        )}
                    </div>

                    <div className="md:hidden flex items-center z-50">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-600 hover:text-gray-900 focus:outline-none"
                        >
                            {mobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2 shadow-inner">
                            {isLoggedIn && (
                                <>
                                    <Link to="/users" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">View Users</Link>
                                    <Link to="/reports" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Reports</Link>
                                    <Link to="/settings" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Settings</Link>
                                    <Link to="/logs" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Logs</Link>
                                    <Link to="/notifications" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Notifications</Link>
                                </>
                            )}

                            <div className="border-t border-gray-100 pt-4 mt-4">
                                {isLoggedIn ? (
                                    <button onClick={handleLogout} className="block w-full text-center px-4 py-2 bg-[#22C55E] text-white rounded-lg text-base font-semibold hover:bg-[#16A34A]">
                                        Sign Out
                                    </button>
                                ) : (
                                    <Link to="/" className="block w-full text-center px-4 py-2 bg-[#22C55E] text-white rounded-lg text-base font-semibold hover:bg-[#16A34A] mb-3">
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
