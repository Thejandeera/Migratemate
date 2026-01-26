import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { clearAuthData, isAuthenticated, getUserData } from '../utils/auth';
import { API_URL } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, Box, MessageSquare, Star, Settings } from 'lucide-react';
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

    // API Base URL imported from utils/api


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
                fetchNotifications(user.id);
            }
        };

        checkAuth();
        document.addEventListener('scroll', handleScroll);

        // Close notifications on click outside
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
        setMobileMenuOpen(false);
    }, [location]);

    const fetchNotifications = async (userId) => {
        if (!userId) return;
        try {
            const token = localStorage.getItem('token'); // or sessionStorage
            // Assuming we might need headers if secured, but 'getUserData' implies we have access
            // Adding Authorization header just in case since we secured endpoints
            // You might need to adjust how you retrieve the token based on 'utils/auth'
            const storedToken = sessionStorage.getItem('token') || localStorage.getItem('token');

            const response = await fetch(`${API_URL}/notifications/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${storedToken}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                // Sort by new to old
                const sortedData = data.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
                setNotifications(sortedData);
                setUnreadCount(sortedData.filter(n => !n.read).length);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const storedToken = sessionStorage.getItem('token') || localStorage.getItem('token');
            await fetch(`${API_URL}/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${storedToken}`
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
        if (!userData?.id) return;
        try {
            const storedToken = sessionStorage.getItem('token') || localStorage.getItem('token');
            await fetch(`${API_URL}/notifications/user/${userData.id}/read-all`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${storedToken}`
                }
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const deleteNotification = async (e, notificationId) => {
        e.stopPropagation(); // Prevent toggling read status if clicking delete
        try {
            const storedToken = sessionStorage.getItem('token') || localStorage.getItem('token');
            await fetch(`${API_URL}/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${storedToken}`
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
        if (!userData?.id) return;
        try {
            const storedToken = sessionStorage.getItem('token') || localStorage.getItem('token');
            await fetch(`${API_URL}/notifications/user/${userData.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${storedToken}`
                }
            });
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to delete all notifications", error);
        }
    };

    const handleLogout = () => {
        clearAuthData();
        setIsLoggedIn(false);
        setUserData(null);
        navigate('/');
    }

    const getIcon = (type) => {
        // You can map 'color' or check 'title' to decide icon if 'type' isn't explicitly stored
        // Using naive logic based on title or random mapping for demo if type is missing
        // or just use generic icons based on 'color' which we have.
        // The user prompt mentions "color (red, green...)"

        switch (type) {
            case 'GREEN': return <Box className="w-5 h-5 text-green-600" />;
            case 'RED': return <MessageSquare className="w-5 h-5 text-red-600" />; // Or Alert
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
                    className={`absolute mt-3 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[60] 
                        ${mobile ? 'right-[-50px] w-[90vw] max-w-sm' : 'right-0 w-80 sm:w-96'}`}
                >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-medium text-gray-500 hover:text-[#22C55E] flex items-center gap-1 transition-colors"
                                title="Mark all as read"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                Read All
                            </button>
                            <div className="h-4 w-px bg-gray-300"></div>
                            <button
                                onClick={deleteAllNotifications}
                                className="text-xs font-medium text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                                title="Delete all notifications"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Clear All
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                        {notifications.length === 0 ? (
                            <div className="py-8 text-center text-gray-500 text-sm">
                                No notifications yet
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`relative p-4 hover:bg-gray-50 transition-colors group cursor-pointer ${!notification.read ? 'bg-green-50 border-l-4 border-green-500' : 'bg-white border-l-4 border-transparent'
                                            }`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1 p-2 rounded-lg h-fit ${notification.color === 'GREEN' ? 'bg-green-100 text-green-600' :
                                                notification.color === 'RED' ? 'bg-red-100 text-red-600' :
                                                    notification.color === 'YELLOW' ? 'bg-yellow-100 text-yellow-600' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {getIcon(notification.color)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`text-sm font-semibold truncate pr-6 ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.read && (
                                                        <span className="w-2 h-2 rounded-full bg-[#22C55E] flex-shrink-0 mt-1.5 shadow-[0_0_5px_rgba(34,197,94,0.6)]"></span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-1.5">
                                                    {notification.description}
                                                </p>
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {formatDistanceToNow(new Date(notification.createdTime), { addSuffix: true })}
                                                </span>
                                            </div>

                                            {/* Delete Button (Visible on Hover) */}
                                            <button
                                                onClick={(e) => deleteNotification(e, notification.id)}
                                                className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                                title="Delete"
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
                        <Link to="/notifications" onClick={() => setShowNotifications(false)} className="text-xs font-semibold text-gray-600 hover:text-[#22C55E] transition-colors">
                            View all notifications
                        </Link>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${scrolled || mobileMenuOpen ? 'bg-white shadow-md py-4' : 'bg-[#F0FDF4] py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">

                    <Link to="/" className="flex items-center gap-2 z-50">
                        <div className="bg-[#22C55E] p-2 rounded-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-gray-800">
                            MigrateMate
                        </span>
                    </Link>


                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-sm font-medium text-gray-900 bg-gray-200/50 px-3 py-1.5 rounded-md">Home</Link>
                        <Link to="/marketplace" className="text-sm font-medium text-gray-500 hover:text-gray-900">Marketplace</Link>
                        <Link to="/community" className="text-sm font-medium text-gray-500 hover:text-gray-900">Community</Link>
                        <Link to="/sos" className="text-sm font-medium text-gray-500 hover:text-gray-900">SOS</Link>
                        <Link to="/profile" className="text-sm font-medium text-gray-500 hover:text-gray-900">Profile</Link>
                        <Link to="/scanner" className="text-sm font-medium text-gray-500 hover:text-gray-900">Scanner</Link>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        {/* Notification Bell */}
                        {isLoggedIn && (
                            <div className="relative" ref={notificationRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                                    aria-label="Notifications"
                                >
                                    <Bell className="w-6 h-6" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {renderNotificationDropdown()}
                            </div>
                        )}


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
                                <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-[#22C55E] text-white rounded-lg text-sm font-semibold hover:bg-[#16A34A] transition shadow-md hover:shadow-lg">
                                    Dashboard
                                </Link>
                            </>
                        )}
                    </div>


                    <div className="md:hidden flex items-center gap-3 z-50">
                        {isLoggedIn && (
                            <div className="relative" ref={mobileNotificationRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                                    aria-label="Notifications"
                                >
                                    <Bell className="w-6 h-6" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                                {renderNotificationDropdown(true)}
                            </div>
                        )}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-600 hover:text-gray-900 focus:outline-none"
                            aria-label="Toggle menu"
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
                            <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Home</Link>
                            <Link to="/marketplace" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Marketplace</Link>
                            <Link to="/community" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Community</Link>
                            <Link to="/sos" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">SOS</Link>
                            <Link to="/profile" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Profile</Link>
                            <Link to="/scanner" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Scanner</Link>

                            <div className="border-t border-gray-100 pt-4 mt-4">
                                {isLoggedIn ? (
                                    <>
                                        <Link to="/dashboard" className="block w-full text-center px-4 py-2 bg-[#22C55E] text-white rounded-lg text-base font-semibold hover:bg-[#16A34A] mb-3">
                                            Dashboard
                                        </Link>
                                        <button onClick={handleLogout} className="block w-full text-center px-4 py-2 border border-red-200 text-red-600 rounded-lg text-base font-semibold hover:bg-red-50">
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" className="block w-full text-center px-4 py-2 border border-[#22C55E] text-[#22C55E] rounded-lg text-base font-semibold hover:bg-green-50 mb-3">
                                            Sign In
                                        </Link>
                                        <Link to="/dashboard" className="block w-full text-center px-4 py-2 bg-[#22C55E] text-white rounded-lg text-base font-semibold hover:bg-[#16A34A]">
                                            Get Started
                                        </Link>
                                    </>
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
