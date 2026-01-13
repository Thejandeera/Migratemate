import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { clearAuthData, isAuthenticated } from '../utils/auth';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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

        // Check auth on mount and when location changes (login/logout events)
        checkAuth();
        document.addEventListener('scroll', handleScroll);

        return () => {
            document.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled, location]);

    const handleLogout = () => {
        clearAuthData();
        setIsLoggedIn(false);
        navigate('/');
    }

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-4' : 'bg-[#F0FDF4] py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="bg-[#22C55E] p-2 rounded-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-gray-800">
                            MigrateMate
                        </span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-sm font-medium text-gray-900 bg-gray-200/50 px-3 py-1.5 rounded-md">Home</Link>
                        <Link to="/marketplace" className="text-sm font-medium text-gray-500 hover:text-gray-900">Marketplace</Link>
                        <Link to="/community" className="text-sm font-medium text-gray-500 hover:text-gray-900">Community</Link>
                        <Link to="/sos" className="text-sm font-medium text-gray-500 hover:text-gray-900">SOS</Link>
                        <Link to="/profile" className="text-sm font-medium text-gray-500 hover:text-gray-900">Profile</Link>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-600 hover:text-gray-900">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>

                        {isLoggedIn ? (
                            <div className="flex items-center gap-4">
                                <Link to="/dashboard" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#22C55E] text-white rounded-lg text-sm font-semibold hover:bg-[#16A34A] transition">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                                    Dashboard
                                </Link>
                                <button onClick={handleLogout} className="text-sm font-semibold text-gray-600 hover:text-red-500">
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-[#22C55E]">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
