import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { clearAuthData, isAuthenticated, getUserData, getAuthData } from '../utils/auth';
import { API_URL } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Trash2, Box, MessageSquare, Star, Settings, Menu, X, LogOut, LayoutDashboard, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Notification State
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationRef = useRef(null);
    const mobileNotificationRef = useRef(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        const checkAuth = () => {
            const authStatus = isAuthenticated();
            setIsLoggedIn(authStatus);
            if (authStatus) {
                const user = getUserData();
                setUserData(user);
                fetchNotifications();
            }
        };

        checkAuth();
        document.addEventListener('scroll', handleScroll);

        const handleClickOutside = (event) => {
            if (
                notificationRef.current && !notificationRef.current.contains(event.target) &&
                mobileNotificationRef.current && !mobileNotificationRef.current.contains(event.target)
            ) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [scrolled, location]);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    const handleAuthNavigation = (e) => {
        if (!isLoggedIn) {
            e.preventDefault();
            navigate('/login');
        }
    };

    const fetchNotifications = async () => {
        if (!isLoggedIn) return;
        try {
            const authData = getAuthData();
            if (!authData?.token) return;

            const response = await fetch(`${API_URL}/sos-notifications`, {
                headers: {
                    'Authorization': `Bearer ${authData.token}`
                }
            });
            if (response.ok) {
                const jsonResponse = await response.json();
                if (jsonResponse.success) {
                    const data = jsonResponse.data;
                    const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    const mappedNotifications = sortedData.map(n => ({
                        ...n,
                        description: n.message,
                        createdTime: n.createdAt,
                        read: n.isRead,
                        color: n.notificationType === 'SOS_ALERT' ? 'RED' :
                            n.notificationType === 'SOS_RESPONSE' ? 'GREEN' : 'GRAY'
                    }));

                    setNotifications(mappedNotifications);
                    setUnreadCount(mappedNotifications.filter(n => !n.read).length);
                }
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const authData = getAuthData();
            if (!authData?.token) return;
            await fetch(`${API_URL}/sos-notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authData.token}`
                }
            });
            setNotifications(prev => prev.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const authData = getAuthData();
            if (!authData?.token) return;
            await fetch(`${API_URL}/sos-notifications/read-all`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authData.token}`
                }
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const deleteNotification = async (e, notificationId) => {
        e.stopPropagation();
        try {
            const authData = getAuthData();
            if (!authData?.token) return;
            await fetch(`${API_URL}/sos-notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authData.token}`
                }
            });
            setNotifications(prev => {
                const newNotifications = prev.filter(n => n.id !== notificationId);
                setUnreadCount(newNotifications.filter(n => !n.read).length);
                return newNotifications;
            });
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    };

    const deleteAllNotifications = async () => {
        console.warn("Delete all not supported yet");
        setNotifications([]);
        setUnreadCount(0);
    };

    const handleLogout = () => {
        clearAuthData();
        setIsLoggedIn(false);
        setUserData(null);
        navigate('/');
    }

    const getIcon = (type) => {
        switch (type) {
            case 'GREEN': return <Box className="w-5 h-5 text-green-600" />;
            case 'RED': return <MessageSquare className="w-5 h-5 text-red-600" />;
            case 'YELLOW': return <Star className="w-5 h-5 text-yellow-500" />;
            case 'GRAY': return <Settings className="w-5 h-5 text-gray-500" />;
            default: return <Box className="w-5 h-5 text-blue-600" />;
        }
    };

    const renderNotificationDropdown = (mobile = false) => (
        <AnimatePresence>
            {showNotifications && (
                <motion.div
                    key={mobile ? 'mobile-dropdown' : 'desktop-dropdown'}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute mt-4 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[60] 
                        ${mobile ? 'right-[-80px] w-[90vw] max-w-sm' : 'right-0 w-80 sm:w-96'}`}
                >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-bold text-gray-500 hover:text-green-600 flex items-center gap-1.5 transition-colors"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                Read All
                            </button>
                            <div className="h-4 w-px bg-gray-200"></div>
                            <button
                                onClick={deleteAllNotifications}
                                className="text-xs font-bold text-gray-500 hover:text-red-500 flex items-center gap-1.5 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Clear
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        {notifications.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center text-gray-400">
                                <Bell className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-sm font-medium">No new notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`relative p-4 hover:bg-gray-50 transition-colors group cursor-pointer ${!notification.read ? 'bg-green-50/30' : 'bg-white'}`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-0.5 p-2 rounded-xl h-fit shadow-sm ${notification.color === 'GREEN' ? 'bg-green-100 text-green-600' :
                                                notification.color === 'RED' ? 'bg-red-100 text-red-600' :
                                                    notification.color === 'YELLOW' ? 'bg-yellow-100 text-yellow-600' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {getIcon(notification.color)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`text-sm font-bold truncate pr-6 ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.read && (
                                                        <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1.5 shadow-sm shadow-green-200"></span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">
                                                    {notification.description}
                                                </p>
                                                <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded-full inline-block">
                                                    {formatDistanceToNow(new Date(notification.createdTime), { addSuffix: true })}
                                                </span>
                                            </div>

                                            <button
                                                onClick={(e) => deleteNotification(e, notification.id)}
                                                className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-center">
                        <Link to="/notifications" onClick={() => setShowNotifications(false)} className="text-xs font-bold text-green-600 hover:text-green-700 transition-colors flex items-center justify-center gap-1">
                            View All Notifications
                            <Box className="w-3 h-3" />
                        </Link>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    const NavLink = ({ to, label, primary = false, active = false, onClick }) => (
        <Link
            to={to}
            onClick={onClick}
            className={`
                text-sm font-bold px-4 py-2 rounded-xl transition-all duration-200
                ${active
                    ? 'bg-green-50 text-green-700'
                    : primary
                        ? 'bg-green-600 text-white shadow-lg shadow-green-200 hover:bg-green-700 hover:shadow-green-300 transform hover:-translate-y-0.5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
            `}
        >
            {label}
        </Link>
    );

    return (
        <nav
            className={`fixed top-0 left-0 right-0 w-full z-[9999] transition-all duration-300 ${scrolled || mobileMenuOpen
                ? 'bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm py-3'
                : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">

                    <Link to="/" className="flex items-center gap-3 z-50 group">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl shadow-lg shadow-green-200 group-hover:shadow-green-300 transition-all duration-300 group-hover:-translate-y-0.5">
                            <Box className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">
                            MigrateMate
                        </span>
                    </Link>

                    <div className="hidden lg:flex items-center space-x-1 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                        <NavLink to="/" label="Home" active={location.pathname === '/'} />
                        <NavLink to="/marketplace" onClick={handleAuthNavigation} label="Marketplace" active={location.pathname === '/marketplace'} />
                        <NavLink to="/community" onClick={handleAuthNavigation} label="Community" active={location.pathname === '/community'} />
                        <NavLink to="/journey-planner" label="Journey Planner" active={location.pathname === '/journey-planner'} />
                        <NavLink to="/sos" onClick={handleAuthNavigation} label="SOS" active={location.pathname === '/sos'} />
                        <NavLink to="/scanner" label="Scanner" active={location.pathname === '/scanner'} />
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        {isLoggedIn && (
                            <div className="relative" ref={notificationRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className={`relative p-2.5 rounded-xl transition-all ${showNotifications ? 'bg-green-50 text-green-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                                >
                                    <Bell className="w-5 h-5" strokeWidth={2.5} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                    )}
                                </button>
                                {renderNotificationDropdown()}
                            </div>
                        )}

                        {isLoggedIn ? (
                            <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                                <Link to="/dashboard" className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>
                                <Link to="/profile" className="hidden lg:flex p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
                                    <User className="w-5 h-5" strokeWidth={2.5} />
                                </Link>
                                <button onClick={handleLogout} className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                    <LogOut className="w-5 h-5" strokeWidth={2.5} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-gray-900 px-4 py-2">
                                    Sign In
                                </Link>
                                <Link to="/signup" className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 hover:shadow-green-300 hover:-translate-y-0.5">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="lg:hidden flex items-center gap-3 z-50">
                        {isLoggedIn && (
                            <div className="relative" ref={mobileNotificationRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 text-gray-600 hover:text-gray-900"
                                >
                                    <Bell className="w-6 h-6" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                    )}
                                </button>
                                {renderNotificationDropdown(true)}
                            </div>
                        )}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {mobileMenuOpen && (
                ReactDOM.createPortal(
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-[10000] bg-white flex flex-col justify-center items-center"
                        >
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                            >
                                <X className="w-8 h-8" />
                            </button>

                            <div className="flex flex-col items-center space-y-6 w-full max-w-sm px-6">
                                <div className="flex flex-col items-center gap-4 w-full">
                                    <NavLink to="/" label="Home" active={location.pathname === '/'} onClick={() => setMobileMenuOpen(false)} />
                                    <NavLink to="/marketplace" label="Marketplace" active={location.pathname === '/marketplace'} onClick={(e) => { handleAuthNavigation(e); setMobileMenuOpen(false); }} />
                                    <NavLink to="/community" label="Community" active={location.pathname === '/community'} onClick={(e) => { handleAuthNavigation(e); setMobileMenuOpen(false); }} />
                                    <NavLink to="/journey-planner" label="Journey Planner" active={location.pathname === '/journey-planner'} onClick={() => setMobileMenuOpen(false)} />
                                    <NavLink to="/sos" label="Emergency SOS" active={location.pathname === '/sos'} onClick={(e) => { handleAuthNavigation(e); setMobileMenuOpen(false); }} />
                                    <Link to="/scanner" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-gray-600 hover:text-green-600 transition-colors">Scanner</Link>
                                </div>

                                {isLoggedIn && (
                                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-gray-600 hover:text-green-600 transition-colors">My Profile</Link>
                                )}

                                <div className="w-16 h-1 bg-gray-100 rounded-full"></div>

                                {isLoggedIn ? (
                                    <div className="flex flex-col gap-3 w-full">
                                        <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full text-center px-6 py-3 bg-gray-900 text-white rounded-xl text-lg font-bold shadow-lg hover:bg-gray-800 transition-all">
                                            Dashboard
                                        </Link>
                                        <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-center px-6 py-3 bg-red-50 text-red-600 rounded-xl text-lg font-bold hover:bg-red-100 transition-colors">
                                            Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3 w-full">
                                        <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center px-6 py-3 border-2 border-gray-100 text-gray-700 rounded-xl text-lg font-bold hover:bg-gray-50 transition-colors">
                                            Sign In
                                        </Link>
                                        <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="w-full text-center px-6 py-3 bg-green-600 text-white rounded-xl text-lg font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-all">
                                            Get Started
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>,
                    document.body
                )
            )}
        </nav>
    );
};

export default Navbar;
