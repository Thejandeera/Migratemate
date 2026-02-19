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
    User,
    Sparkles
} from 'lucide-react';
import AssistantChat from '../components/Assistant/AssistantChat';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

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
            color: "text-blue-600",
            bg: "bg-blue-50",
            link: "/services/transport"
        },
        {
            title: "Find Housing",
            desc: "Verified rentals & stays",
            icon: Home,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            link: "/marketplace"
        },
        {
            title: "Ask AI Assistant",
            desc: "Instant answers 24/7",
            icon: Bot,
            color: "text-purple-600",
            bg: "bg-purple-50",
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
        <div className="min-h-screen font-sans">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-8">
                {/* SOS Alert Banner */}
                {sosAlerts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50/90 backdrop-blur-md border border-red-200 rounded-3xl p-6 shadow-lg shadow-red-100 flex flex-col sm:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-red-100 p-3 rounded-full animate-pulse shadow-sm shadow-red-200">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-neural-dark">Active Emergency Alert</h3>
                                <p className="text-gray-600 font-medium">
                                    {sosAlerts.length} person{sosAlerts.length > 1 ? 's' : ''} reported an emergency nearby.
                                </p>
                                <div className="mt-2 flex items-center gap-2 text-sm text-red-700 bg-white/50 px-3 py-1 rounded-full w-fit border border-red-100 font-bold">
                                    <MapPin className="w-4 h-4" />
                                    {sosAlerts[0].address}
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={() => navigate('/sos')}
                            className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 border-none w-full sm:w-auto"
                        >
                            View & Respond
                            <Navigation className="w-5 h-5 ml-2" />
                        </Button>
                    </motion.div>
                )}

                {/* Hero Section */}
                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-white/80 to-white/40 p-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-deep-green/5 to-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="relative z-10 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-8">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 group-hover:scale-105 transition-transform duration-300">
                                    <img
                                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.firstName || 'User'}&background=random`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {user.isVerified && (
                                    <div className="absolute bottom-1 right-1 bg-deep-green text-white p-1.5 rounded-full border-4 border-white shadow-sm" title="Verified User">
                                        <Shield className="w-4 h-4 fill-current" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className="text-3xl sm:text-4xl font-extrabold text-neural-dark tracking-tight">
                                        Hello, {user.firstName || 'User'}!
                                    </h1>
                                    <span className="text-3xl animate-wave origin-bottom-right inline-block">👋</span>
                                </div>
                                <p className="text-lg text-gray-500 font-medium">
                                    Welcome to {user.destinationCountry || 'your new home'}. What's on your mind today?
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={() => navigate('/sos')}
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm w-full md:w-auto"
                        >
                            <AlertCircle className="w-5 h-5 mr-2" />
                            Emergency SOS
                        </Button>
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Search Bar */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Search className="text-gray-400 w-5 h-5 group-focus-within:text-deep-green transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search for services, people, or help..."
                                className="w-full pl-14 pr-6 py-4 bg-white/60 backdrop-blur-md border border-white/60 rounded-full shadow-sm focus:ring-2 focus:ring-deep-green/20 focus:border-deep-green/50 transition-all text-neural-dark font-medium placeholder:text-gray-400"
                            />
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h2 className="text-xl font-bold text-neural-dark mb-6 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-deep-green" />
                                Quick Actions
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {quickActions.map((action, idx) => (
                                    <Card
                                        key={idx}
                                        onClick={() => action.link && navigate(action.link)}
                                        className="p-6 border-none hover:bg-white/90 bg-white/60 cursor-pointer group flex flex-col items-center text-center sm:items-start sm:text-left"
                                        delay={idx * 0.1}
                                    >
                                        <div className={`w-14 h-14 ${action.bg} ${action.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm`}>
                                            <action.icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="font-bold text-neural-dark mb-1 text-lg">{action.title}</h3>
                                        <p className="text-sm text-gray-500 font-medium">{action.desc}</p>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* AI Suggestions */}
                        <AiSuggestions user={user} />

                        {/* Recent Activity */}
                        <Card className="p-8 border-none bg-white/60">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-neural-dark">Recent Activity</h2>
                                <button className="text-sm font-bold text-deep-green hover:text-green-700 flex items-center gap-1 hover:underline decoration-2 underline-offset-4 decoration-deep-green/30">
                                    View All <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {loadingBookings ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-green mb-4"></div>
                                        <p className="font-medium">Loading activity...</p>
                                    </div>
                                ) : activeRequests.length === 0 ? (
                                    <div className="text-center py-12 bg-white/50 rounded-3xl border border-dashed border-gray-200">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-neural-dark">No recent activity</h3>
                                        <p className="text-gray-500 font-medium mt-1">Your planned journeys and bookings will appear here.</p>
                                    </div>
                                ) : (
                                    activeRequests.map((req) => (
                                        <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/50 border border-white/60 hover:bg-white hover:shadow-md transition-all duration-300">
                                            <div className="flex items-center gap-5">
                                                <div className="bg-neural-bg p-3.5 rounded-2xl text-neural-dark shadow-sm">
                                                    <req.icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-neural-dark text-lg">{req.title}</h3>
                                                    <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500 font-medium">
                                                        <span className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-md shadow-sm">
                                                            <Clock className="w-3.5 h-3.5 text-deep-green" /> {req.date}
                                                        </span>
                                                        {req.helper && (
                                                            <span className="flex items-center gap-1.5">
                                                                <User className="w-3.5 h-3.5" /> {req.helper}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`px-4 py-2 rounded-full text-xs font-bold text-center w-full sm:w-auto uppercase tracking-wide ${req.statusColor}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Profile Summary */}
                        <Card className="p-8 border-none bg-white/60">
                            <h3 className="font-bold text-neural-dark mb-6 text-lg">My Profile</h3>
                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden shadow-md">
                                    <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.firstName || 'User'}&background=random`} alt={user.firstName} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="font-bold text-neural-dark text-xl">{user.firstName || 'User'}</div>
                                    <div className="text-sm text-gray-500 font-medium">{user.email || 'email@example.com'}</div>
                                </div>
                            </div>

                            <div className={`p-5 rounded-2xl border ${user.isVerified ? 'bg-green-50/50 border-green-100' : 'bg-yellow-50/50 border-yellow-100'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className={`w-5 h-5 ${user.isVerified ? 'text-green-600' : 'text-yellow-600'}`} />
                                    <span className={`font-bold text-sm ${user.isVerified ? 'text-green-700' : 'text-yellow-700'}`}>
                                        {user.isVerified ? 'Identity Verified' : 'Verification Pending'}
                                    </span>
                                </div>
                                <p className={`text-xs font-medium leading-relaxed ${user.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {user.isVerified
                                        ? " Your trusted community status is active."
                                        : "Verify your ID to access all features."}
                                </p>
                                {!user.isVerified && (
                                    <Button
                                        onClick={() => navigate('/profile')}
                                        size="sm"
                                        className="mt-4 w-full bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg shadow-yellow-200 border-none"
                                    >
                                        Complete Verification
                                    </Button>
                                )}
                            </div>
                        </Card>

                        {/* Resources */}
                        <Card className="p-8 border-none bg-white/60">
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="w-5 h-5 text-deep-green" />
                                <h3 className="font-bold text-neural-dark text-lg">Essential Guides</h3>
                            </div>
                            <p className="text-sm text-gray-500 mb-6 font-medium">Curated for new arrivals in {user.destinationCountry || 'Australia'}.</p>

                            <div className="space-y-3">
                                {resources.map((res, idx) => (
                                    <a key={idx} href="#" className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-white/50 hover:bg-white hover:shadow-md transition-all group">
                                        <div className="bg-neural-bg p-2.5 rounded-xl text-gray-400 group-hover:text-deep-green group-hover:bg-green-50 transition-colors">
                                            <res.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-600 group-hover:text-neural-dark transition-colors">
                                            {res.title}
                                        </span>
                                        <ChevronRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-deep-green trantision-colors" />
                                    </a>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full mt-6 border-gray-200 text-gray-600 hover:text-neural-dark hover:border-neural-dark">
                                View Helper Hub
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>

            <Footer />
            <AssistantChat />
        </div>
    );
};

export default Dashboard;
