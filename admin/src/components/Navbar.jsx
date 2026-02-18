import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { clearAuthData, isAuthenticated } from '../utils/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Briefcase,
    FileText,
    MessageSquare,
    Calendar,
    LogOut,
    Menu,
    X,
    LayoutDashboard
} from 'lucide-react';

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
    };

    const navLinks = [
        { path: '/users', label: 'Users', icon: Users },
        { path: '/gigs', label: 'Gigs', icon: Briefcase },
        { path: '/bookings', label: 'Bookings', icon: Calendar },
        { path: '/communities', label: 'Communities', icon: MessageSquare },
        { path: '/reports', label: 'Reports', icon: FileText },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${scrolled || mobileMenuOpen
                ? 'bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm'
                : 'bg-white/80 backdrop-blur-md border-b border-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    <Link to={isLoggedIn ? "/users" : "/"} className="flex items-center gap-3 z-50 group">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2.5 rounded-xl shadow-lg shadow-green-200 group-hover:shadow-green-300 transition-all duration-300 group-hover:-translate-y-0.5">
                            <LayoutDashboard className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">
                            MigrateMate <span className="text-gray-400 font-medium">Admin</span>
                        </span>
                    </Link>

                    {isLoggedIn && (
                        <div className="hidden md:flex items-center space-x-1">
                            {navLinks.map((link) => {
                                const isActive = location.pathname.startsWith(link.path);
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-200 ${isActive
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon size={18} className={isActive ? "text-green-600" : "text-gray-400"} />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    <div className="hidden md:flex items-center gap-4">
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        ) : (
                            !location.pathname.includes('login') && (
                                <Link
                                    to="/"
                                    className="px-5 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-all shadow-md shadow-green-200 hover:shadow-lg flex items-center gap-2"
                                >
                                    Sign In
                                </Link>
                            )
                        )}
                    </div>

                    <div className="md:hidden flex items-center z-50">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none"
                        >
                            {mobileMenuOpen ? (
                                <X size={24} />
                            ) : (
                                <Menu size={24} />
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
                        className="md:hidden bg-white border-t border-gray-100 overflow-hidden absolute w-full left-0 top-20 shadow-xl rounded-b-3xl"
                    >
                        <div className="px-4 py-6 space-y-2">
                            {isLoggedIn && (
                                <>
                                    {navLinks.map((link) => {
                                        const isActive = location.pathname.startsWith(link.path);
                                        const Icon = link.icon;
                                        return (
                                            <Link
                                                key={link.path}
                                                to={link.path}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={`block px-4 py-3 rounded-xl text-base font-bold flex items-center gap-3 transition-colors ${isActive
                                                    ? 'bg-gray-50 text-gray-900'
                                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg ${isActive ? 'bg-white shadow-sm text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    <Icon size={20} />
                                                </div>
                                                {link.label}
                                            </Link>
                                        );
                                    })}
                                    <div className="h-px bg-gray-100 my-4 mx-4"></div>
                                </>
                            )}

                            <div className="px-2">
                                {isLoggedIn ? (
                                    <button
                                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                        className="w-full px-4 py-3.5 bg-gray-900 text-white rounded-2xl text-base font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                                    >
                                        <LogOut size={20} />
                                        Sign Out
                                    </button>
                                ) : (
                                    <Link
                                        to="/"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full block text-center px-4 py-3.5 bg-green-500 text-white rounded-2xl text-base font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-200"
                                    >
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
