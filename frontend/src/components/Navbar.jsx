import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { clearAuthData, isAuthenticated, getUserData, getAuthData } from '../utils/auth';
import { API_URL } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Trash2, Box, MessageSquare, Star, Settings, Menu, X, LogOut, LayoutDashboard, User, ScanLine, Home, Store, Users, Compass, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Button from './ui/Button';
import migrateIcon from '../assets/migrate-icon.png';

// Simple NavLink without internal indicator
const NavLink = React.forwardRef(({ to, label, isActive, onClick }, ref) => (
    <Link
        ref={ref}
        to={to}
        onClick={onClick}
        className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-600 hover:text-neural-dark hover:bg-black/5'}`}
    >
        <span className="relative z-10">{label}</span>
    </Link>
));

// Simple NavIcon without internal indicator
const NavIcon = React.forwardRef(({ to, icon: Icon, isActive, title, onClick, className }, ref) => (
    <Link
        ref={ref}
        to={to}
        onClick={onClick}
        className={`relative p-2.5 rounded-full transition-colors duration-200 ${className} ${
            isActive
            ? 'text-white'
            : 'text-gray-500 hover:text-neural-dark hover:bg-black/5'
        }`}
        title={title}
    >
        <Icon className="w-5 h-5 relative z-10" />
    </Link>
));

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Notification State
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationRef = useRef(null);
    const mobileNotificationRef = useRef(null);
    const [userData, setUserData] = useState(getUserData());

    // Nav indicator refs
    const navContainerRef = useRef(null);
    const navLinkRefs = useRef({});
    const [indicatorStyle, setIndicatorStyle] = useState(null);
    const [indicatorVisible, setIndicatorVisible] = useState(false);

    // All trackable nav paths
    const allNavPaths = ['/marketplace', '/community', '/journey-planner', '/sos', '/scanner', '/dashboard', '/profile'];

    const updateIndicator = useCallback(() => {
        const activeRef = navLinkRefs.current[location.pathname];
        const container = navContainerRef.current;
        if (activeRef && container) {
            const linkRect = activeRef.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            setIndicatorStyle({
                left: linkRect.left - containerRect.left,
                top: linkRect.top - containerRect.top,
                width: linkRect.width,
                height: linkRect.height,
            });
            setIndicatorVisible(true);
        } else {
            setIndicatorVisible(false);
        }
    }, [location.pathname]);

    useEffect(() => {
        // Small delay to let DOM settle after route change
        const timer = setTimeout(updateIndicator, 50);
        window.addEventListener('resize', updateIndicator);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateIndicator);
        };
    }, [updateIndicator]);

    const setNavRef = useCallback((path) => (el) => {
        navLinkRefs.current[path] = el;
    }, []);

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
            const isOutsideDesktop = !notificationRef.current || !notificationRef.current.contains(event.target);
            const isOutsideMobile = !mobileNotificationRef.current || !mobileNotificationRef.current.contains(event.target);
            if (isOutsideDesktop && isOutsideMobile) {
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
            case 'GREEN': return <Box className="w-5 h-5 text-deep-green" />;
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
                    className={`absolute mt-4 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden z-[60] 
                        ${mobile ? 'right-[-80px] w-[90vw] max-w-sm' : 'right-0 w-80 sm:w-96'}`}
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/50 bg-white/50">
                        <h3 className="font-bold text-neural-dark">Notifications</h3>
                        <div className="flex items-center gap-3">
                            <button onClick={markAllAsRead} className="text-xs font-bold text-gray-500 hover:text-deep-green transition-colors">
                                Read All
                            </button>
                            <div className="h-4 w-px bg-gray-200"></div>
                            <button onClick={deleteAllNotifications} className="text-xs font-bold text-gray-500 hover:text-red-500 transition-colors">
                                Clear
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
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
                                        className={`relative p-4 hover:bg-white/80 transition-colors group cursor-pointer ${!notification.read ? 'bg-[#1a3a1d]/5' : 'bg-transparent'}`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-0.5 p-2 rounded-full bg-white shadow-sm h-fit">
                                                {getIcon(notification.color)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`text-sm font-bold truncate pr-6 ${!notification.read ? 'text-neural-dark' : 'text-gray-600'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.read && (
                                                        <span className="w-2 h-2 rounded-full bg-deep-green flex-shrink-0 mt-1.5"></span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">
                                                    {notification.description}
                                                </p>
                                                <span className="text-[10px] text-gray-400 font-bold bg-gray-100/50 px-2 py-0.5 rounded-full inline-block">
                                                    {formatDistanceToNow(new Date(notification.createdTime), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => deleteNotification(e, notification.id)}
                                                className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <nav
            className={`fixed top-4 left-0 right-0 z-[50] flex justify-center transition-all duration-500`}
        >
            <div
                ref={navContainerRef}
                className={`
                    relative flex items-center justify-between px-2 pl-6 pr-2 py-2
                    bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl shadow-black/5
                    rounded-full transition-all duration-500 w-[95%] max-w-5xl
                `}
            >
                {/* Single animated indicator — always mounted, opacity controlled */}
                {indicatorStyle && (
                    <motion.div
                        animate={{
                            ...indicatorStyle,
                            opacity: indicatorVisible ? 1 : 0,
                        }}
                        transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                        className="absolute bg-neural-dark rounded-full shadow-md pointer-events-none"
                        style={{ zIndex: 0 }}
                    />
                )}
                <Link to="/" className="flex items-center gap-2 group mr-8">
                    <img
                        src={migrateIcon}
                        alt="Logo"
                        className="w-8 h-8 group-hover:scale-110 transition-transform duration-300 object-contain"
                    />
                    <span className="text-lg font-semibold text-neural-dark tracking-tight">
                        MigrateMate
                    </span>
                </Link>

                <div className="hidden lg:flex items-center space-x-1">
                    <NavLink ref={setNavRef('/marketplace')} to="/marketplace" onClick={handleAuthNavigation} label="Marketplace" isActive={location.pathname === '/marketplace'} />
                    <NavLink ref={setNavRef('/community')} to="/community" onClick={handleAuthNavigation} label="Community" isActive={location.pathname === '/community'} />
                    <NavLink ref={setNavRef('/journey-planner')} to="/journey-planner" label="Journey" isActive={location.pathname === '/journey-planner'} />
                    <NavLink ref={setNavRef('/sos')} to="/sos" onClick={handleAuthNavigation} label="SOS" isActive={location.pathname === '/sos'} />
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    {/* Scanner Link Icon - Visible on desktop */}
                    <NavIcon
                        ref={setNavRef('/scanner')}
                        to="/scanner" 
                        icon={ScanLine} 
                        isActive={location.pathname === '/scanner'} 
                        title="AR Scanner" 
                        className="hidden md:flex hover:text-deep-green hover:bg-[#1a3a1d]/5"
                    />

                    {isLoggedIn && (
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`relative p-2.5 rounded-full transition-all ${showNotifications ? 'bg-neural-dark text-white' : 'text-gray-500 hover:bg-black/5 hover:text-neural-dark'}`}
                            >
                                <Bell className="w-5 h-5" strokeWidth={2} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                                )}
                            </button>
                            {renderNotificationDropdown()}
                        </div>
                    )}

                    {isLoggedIn ? (
                        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-gray-200/50">
                            <NavIcon
                                ref={setNavRef('/dashboard')}
                                to="/dashboard" 
                                icon={LayoutDashboard} 
                                isActive={location.pathname === '/dashboard'} 
                                title="Dashboard"
                                className="hover:text-neural-dark hover:bg-black/5"
                            />
                            <NavIcon
                                ref={setNavRef('/profile')}
                                to="/profile" 
                                icon={User} 
                                isActive={location.pathname === '/profile'} 
                                title="Profile"
                                className="hover:text-neural-dark hover:bg-black/5"
                            />
                            <button onClick={handleLogout} className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all" title="Logout">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-2 pl-4">
                            <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-neural-dark px-4 py-2">
                                Log In
                            </Link>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => navigate('/signup')}
                                className="shadow-lg shadow-black/10 font-semibold"
                            >
                                Sign Up
                            </Button>
                        </div>
                    )}

                    <div className="lg:hidden flex items-center gap-2">
                         <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2.5 text-gray-600 hover:bg-black/5 rounded-full"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[45] bg-black/20 backdrop-blur-sm"
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
                        className="fixed top-0 right-0 bottom-0 z-[60] w-[85%] max-w-sm bg-white shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <img src={migrateIcon} alt="Logo" className="w-8 h-8 object-contain" />
                                <span className="text-lg font-semibold text-neural-dark tracking-tight">MigrateMate</span>
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
                            {[
                                { to: '/', label: 'Home', icon: Home, auth: false },
                                { to: '/marketplace', label: 'Marketplace', icon: Store, auth: true },
                                { to: '/community', label: 'Community', icon: Users, auth: true },
                                { to: '/journey-planner', label: 'Journey Planner', icon: Compass, auth: false },
                                { to: '/scanner', label: 'Scanner', icon: ScanLine, auth: true },
                                { to: '/sos', label: 'SOS Emergency', icon: AlertTriangle, auth: true, danger: true },
                            ].map((item, idx) => (
                                <motion.div
                                    key={item.to}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Link
                                        to={item.to}
                                        onClick={(e) => {
                                            if (item.auth) handleAuthNavigation(e);
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${
                                            location.pathname === item.to
                                                ? 'bg-neural-dark text-white'
                                                : item.danger
                                                    ? 'text-red-600 hover:bg-red-50'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-xl ${
                                            location.pathname === item.to 
                                                ? 'bg-white/20'
                                                : item.danger ? 'bg-red-50' : 'bg-gray-100 group-hover:bg-gray-200'
                                        } transition-colors`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-[15px] font-semibold">{item.label}</span>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-gray-100 space-y-3">
                            {isLoggedIn ? (
                                <>
                                    <div className="flex gap-2">
                                        <Link
                                            to="/dashboard"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-neural-dark font-semibold rounded-2xl hover:bg-gray-100 transition-colors text-sm"
                                        >
                                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                                        </Link>
                                        <Link
                                            to="/profile"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-neural-dark font-semibold rounded-2xl hover:bg-gray-100 transition-colors text-sm"
                                        >
                                            <User className="w-4 h-4" /> Profile
                                        </Link>
                                    </div>
                                    <button
                                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 font-semibold rounded-2xl hover:bg-red-50 transition-colors text-sm"
                                    >
                                        <LogOut className="w-4 h-4" /> Sign Out
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Button variant="outline" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="w-full justify-center font-semibold">Log In</Button>
                                    <Button variant="primary" onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }} className="w-full justify-center font-semibold">Sign Up</Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
