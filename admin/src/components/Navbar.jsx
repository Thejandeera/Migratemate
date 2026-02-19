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
} from 'lucide-react';
import migrateIcon from '../assets/migrate-icon.png';

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
                ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm'
                : 'bg-white/80 backdrop-blur-xl border-b border-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    <Link to={isLoggedIn ? "/users" : "/"} className="flex items-center gap-2.5 z-50 group">
                        <img
                            src={migrateIcon}
                            alt="MigrateMate"
                            className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                        <span className="text-lg font-semibold text-neural-dark tracking-tight">
                            MigrateMate <span className="text-gray-400 font-normal">Admin</span>
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
                                        className={`relative px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all duration-200 ${isActive
                                            ? 'text-white'
                                            : 'text-gray-500 hover:text-neural-dark hover:bg-black/5'
                                            }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="admin-nav-indicator"
                                                className="absolute inset-0 bg-neural-dark rounded-full shadow-md"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <Icon size={16} className="relative z-10" />
                                        <span className="relative z-10">{link.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    <div className="hidden md:flex items-center gap-3">
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                title="Sign Out"
                            >
                                <LogOut size={18} />
                            </button>
                        ) : (
                            !location.pathname.includes('login') && (
                                <Link
                                    to="/"
                                    className="px-5 py-2.5 bg-neural-dark text-white rounded-full text-sm font-semibold hover:bg-neural-dark/90 transition-all shadow-md"
                                >
                                    Sign In
                                </Link>
                            )
                        )}
                    </div>

                    <div className="md:hidden flex items-center z-50">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2.5 text-gray-600 hover:text-neural-dark hover:bg-black/5 rounded-full transition-colors"
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

            {/* Mobile Menu - Slide-in Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[45] bg-black/20 backdrop-blur-sm md:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed top-0 right-0 bottom-0 z-[60] w-[85%] max-w-sm bg-white shadow-2xl flex flex-col md:hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                                <img src={migrateIcon} alt="Logo" className="w-8 h-8 object-contain" />
                                <span className="text-lg font-semibold text-neural-dark tracking-tight">Admin</span>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Nav Links */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-1">
                            {isLoggedIn && navLinks.map((link, idx) => {
                                const isActive = location.pathname.startsWith(link.path);
                                const Icon = link.icon;
                                return (
                                    <motion.div
                                        key={link.path}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Link
                                            to={link.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${isActive
                                                ? 'bg-neural-dark text-white'
                                                : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-xl ${isActive
                                                ? 'bg-white/20'
                                                : 'bg-gray-100 group-hover:bg-gray-200'
                                                } transition-colors`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-[15px] font-semibold">{link.label}</span>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100">
                            {isLoggedIn ? (
                                <button
                                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 font-semibold rounded-2xl hover:bg-red-50 transition-colors text-sm"
                                >
                                    <LogOut className="w-4 h-4" /> Sign Out
                                </button>
                            ) : (
                                <Link
                                    to="/"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full block text-center px-4 py-3 bg-neural-dark text-white rounded-2xl font-semibold hover:bg-neural-dark/90 transition-all text-sm"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
