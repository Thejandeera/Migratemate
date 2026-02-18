import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getUserData, isAuthenticated } from '../utils/auth';
import { getMyBookings } from '../utils/bookingApi';
import AiSuggestions from '../components/Dashboard/AiSuggestions';
import { API_URL } from '../utils/api';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import {
    AlertCircle,
    Navigation,
    Search,
    Car,
    Home,
    Bot,
    Calendar,
    ChevronRight,
    Shield,
    BookOpen,
    CreditCard,
    MapPin,
    Clock,
    User
} from 'lucide-react';
import AssistantChat from '../components/Assistant/AssistantChat';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const navigate = useNavigate();
    const user = getUserData();
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [sosAlerts, setSosAlerts] = useState([]);

    // Initialize WebSocket for SOS Alerts
    useEffect(() => {
        const fetchActiveSosAlerts = async () => {
            try {
                const response = await fetch(`${API_URL}/sos/active`);
                if (response.ok) {
                    const result = await response.json();
                    setSosAlerts(result.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch SOS alerts', error);
            }
        };

        fetchActiveSosAlerts();

        const baseUrl = API_URL.replace('/api', '');
        const socket = new SockJS(`${baseUrl}/ws`);
        const client = Stomp.over(() => socket);

        client.connect({}, () => {
            client.subscribe('/topic/sos-alerts', (message) => {
                const alert = JSON.parse(message.body);
                if (alert.status === 'ACTIVE') {
                    setSosAlerts(prev => {
                        if (prev.find(a => a.id === alert.id)) return prev;
                        return [alert, ...prev];
                    });
                } else {
                    setSosAlerts(prev => prev.filter(a => a.id !== alert.id));
                }
            });
        }, (error) => {
            console.error('WebSocket Error:', error);
        });

        return () => {
            if (client && client.connected) {
                client.disconnect();
            }
        };
    }, []);

    const quickActions = [
        {
            title: "Book Airport Pickup",
            desc: "Safe & verified drivers",
            icon: Car,
            bg: "bg-blue-50 text-blue-600",
            link: "/services/transport"
        },
        {
            title: "Find Housing",
            desc: "Verified rentals & stays",
            icon: Home,
            bg: "bg-green-50 text-green-600",
            link: "/marketplace"
        },
        {
            title: "Ask AI Assistant",
            desc: "Instant answers 24/7",
            icon: Bot,
            bg: "bg-purple-50 text-purple-600",
            link: "#assistant"
        }
    ];

    const activeRequests = bookings.slice(0, 3).map(b => ({
        id: b.id,
        title: b.serviceTitle,
        date: new Date(b.requestedDate).toLocaleDateString(),
        status: b.status.charAt(0) + b.status.substring(1).toLowerCase(),
        statusColor: b.status === "ACCEPTED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700",
        helper: b.providerName,
        icon: Calendar
    }));

    const resources = [
        { title: "Getting a Tax File Number (TFN)", icon: BookOpen },
        { title: "Opening a Bank Account", icon: CreditCard },
        { title: "Understanding Medicare", icon: Shield },
        { title: "Public Transport Guide", icon: MapPin }
    ];

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
        } else {
            getMyBookings()
                .then(data => setBookings(data))
                .catch(err => console.error(err))
                .finally(() => setLoadingBookings(false));
        }
    }, [navigate]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-8">

                {/* SOS Alert Banner */}
                {sosAlerts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-red-100 p-3 rounded-full animate-pulse">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Active Emergency Alert</h3>
                                <p className="text-gray-600">
                                    {sosAlerts.length} person{sosAlerts.length > 1 ? 's' : ''} reported an emergency nearby.
                                </p>
                                <div className="mt-2 flex items-center gap-2 text-sm text-red-700 bg-red-100/50 px-3 py-1 rounded-full w-fit">
                                    <MapPin className="w-4 h-4" />
                                    {sosAlerts[0].address}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/sos')}
                            className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 hover:-translate-y-1"
                        >
                            View & Respond
                            <Navigation className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}

                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 opacity-30"></div>
                    <div className="absolute right-0 top-0 w-96 h-96 bg-green-200 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-20"></div>

                    <div className="relative z-10 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100">
                                    <img
                                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.firstName || 'User'}&background=random`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {user.isVerified && (
                                    <div className="absolute bottom-0 right-0 bg-green-500 text-white p-1.5 rounded-full border-4 border-white" title="Verified User">
                                        <Shield className="w-4 h-4 fill-current" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                                    Hello, {user.firstName || 'User'}! 👋
                                </h1>
                                <p className="text-lg text-gray-500 mt-2">
                                    Welcome to {user.destinationCountry || 'your new home'}. What would you like to do today?
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/sos')}
                            className="w-full md:w-auto px-6 py-3 bg-white border-2 border-red-100 text-red-600 rounded-xl font-bold hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            <AlertCircle className="w-5 h-5" />
                            Emergency SOS
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search for services, people, or help..."
                                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-700 font-medium"
                            />
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {quickActions.map((action, idx) => (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ y: -5 }}
                                        onClick={() => action.link && navigate(action.link)}
                                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                                    >
                                        <div className={`w-14 h-14 ${action.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                            <action.icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-1">{action.title}</h3>
                                        <p className="text-sm text-gray-500">{action.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* AI Suggestions */}
                        <AiSuggestions user={user} />

                        {/* Recent Activity */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                                <button className="text-sm font-semibold text-green-600 hover:text-green-700 flex items-center gap-1 hover:underline">
                                    View All <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {loadingBookings ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-4"></div>
                                        <p>Loading activity...</p>
                                    </div>
                                ) : activeRequests.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <h3 className="text-lg font-medium text-gray-900">No recent activity</h3>
                                        <p className="text-gray-500">Your planned journeys and bookings will appear here.</p>
                                    </div>
                                ) : (
                                    activeRequests.map((req) => (
                                        <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className="bg-green-100 p-3 rounded-xl text-green-600">
                                                    <req.icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{req.title}</h3>
                                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {req.date}
                                                        </span>
                                                        {req.helper && (
                                                            <span className="flex items-center gap-1">
                                                                <User className="w-3 h-3" /> {req.helper}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold text-center w-fit ${req.statusColor}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Profile Summary */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                            <h3 className="font-bold text-gray-900 mb-6">My Profile</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden">
                                    <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.firstName || 'User'}&background=random`} alt={user.firstName} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 text-lg">{user.firstName || 'User'}</div>
                                    <div className="text-sm text-gray-500">{user.email || 'email@example.com'}</div>
                                </div>
                            </div>

                            <div className={`p-4 rounded-2xl border ${user.isVerified ? 'bg-green-50 border-green-100' : 'bg-yellow-50 border-yellow-100'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className={`w-5 h-5 ${user.isVerified ? 'text-green-600' : 'text-yellow-600'}`} />
                                    <span className={`font-bold text-sm ${user.isVerified ? 'text-green-700' : 'text-yellow-700'}`}>
                                        {user.isVerified ? 'Identity Verified' : 'Verification Pending'}
                                    </span>
                                </div>
                                <p className={`text-xs ${user.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {user.isVerified
                                        ? " Your trusted community status is active."
                                        : "Verify your ID to access all features."}
                                </p>
                                {!user.isVerified && (
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="mt-3 w-full py-2 bg-yellow-600 text-white rounded-lg text-xs font-bold hover:bg-yellow-700 transition"
                                    >
                                        Complete Verification
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Resources */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                            <h3 className="font-bold text-gray-900 mb-2">Essential Guides</h3>
                            <p className="text-sm text-gray-500 mb-6">Curated for new arrivals in {user.destinationCountry || 'Australia'}.</p>

                            <div className="space-y-3">
                                {resources.map((res, idx) => (
                                    <a key={idx} href="#" className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                                        <div className="bg-gray-100 p-2 rounded-lg text-gray-500 group-hover:text-green-600 group-hover:bg-green-50 transition-colors">
                                            <res.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-green-700 transition-colors">
                                            {res.title}
                                        </span>
                                        <ChevronRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-green-500" />
                                    </a>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition">
                                View Helper Hub
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
            <AssistantChat />
        </div>
    );
};

export default Dashboard;
