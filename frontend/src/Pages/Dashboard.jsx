import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
            color: "text-[#1a3a1d]",
            bg: "bg-[#1a3a1d]/5",
            link: "/services/transport"
        },
        {
            title: "Find Housing",
            desc: "Verified stays",
            icon: Home,
            color: "text-[#1a3a1d]",
            bg: "bg-[#1a3a1d]/5",
            link: "/marketplace"
        },
        {
            title: "Ask AI Assistant",
            desc: "Instant answers 24/7",
            icon: Bot,
            color: "text-[#1a3a1d]",
            bg: "bg-[#1a3a1d]/5",
            link: "#assistant"
        }
    ];

    const activeRequests = bookings.slice(0, 3).map(b => ({
        id: b.id,
        title: b.serviceTitle,
        date: new Date(b.requestedDate).toLocaleDateString(),
        status: b.status.charAt(0) + b.status.substring(1).toLowerCase(),
        statusColor: b.status === "ACCEPTED" ? "bg-[#1a3a1d]/10 text-[#1a3a1d]" : "bg-yellow-50 text-yellow-700",
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
        <div className="min-h-screen">
            {/* Reveal Overlay */}
            <motion.div
                initial={{ scaleY: 1 }}
                animate={{ scaleY: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                style={{ originY: 0 }}
                className="fixed inset-0 z-50 bg-[#1a3a1d]"
            />


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-8">
                {/* SOS Alert Banner */}
                {sosAlerts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50/90 backdrop-blur-md border border-red-200 rounded-3xl p-6 shadow-lg shadow-red-100 flex flex-col sm:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-red-50 p-3 rounded-full animate-pulse">
                                <AlertCircle className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-neural-dark">Active Emergency Alert</h3>
                                <p className="text-gray-500 font-light">
                                    {sosAlerts.length} person{sosAlerts.length > 1 ? 's' : ''} reported an emergency nearby.
                                </p>
                                <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-white/50 px-3 py-1 rounded-full w-fit border border-red-50 font-medium">
                                    <MapPin className="w-3.5 h-3.5" />
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
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="relative overflow-hidden border-none bg-gradient-to-br from-[#1a3a1d] via-[#244f28] to-[#112613] animate-gradient-xy p-0 shadow-2xl shadow-[#1a3a1d]/20 rounded-[2.5rem] min-h-[300px] flex items-center"
                >
                    {/* Ambient Background */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>
                    
                    <div className="relative z-10 p-10 sm:p-14 w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
                        <div className="flex flex-col gap-6 max-w-3xl">
                            <div className="flex flex-col">
                                {/* <span className="text-white text-xs font-bold uppercase tracking-widest mb-2">Welcome Back</span> */}
                                <h1 className="text-5xl sm:text-7xl font-thin text-white tracking-tighter leading-[0.9]">
                                    Hello, <span className="font-thin text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">{user.firstName || 'User'}..!</span>
                                </h1>
                            </div>
                            
                            <p className="text-lg sm:text-2xl text-white/60 font-light tracking-wide max-w-lg leading-relaxed">
                                You're currently in <span className="text-white font-medium border-b border-white/20">{user.destinationCountry || 'Sri Lanka'}</span>. 
                                <br/>What would you like to achieve today?
                            </p>
                        </div>

                        {/* Glass SOS Button */}
                        <div className="w-full md:w-auto mt-4 md:mt-0 ml-auto md:ml-0">
                             <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/sos')}
                                className="group relative overflow-hidden rounded-full bg-white/10 backdrop-blur-md border border-white/10 p-1 pr-6 flex items-center gap-4 transition-all hover:bg-white/20 hover:border-white/20 hover:shadow-2xl hover:shadow-red-900/20"
                            >
                                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform duration-300 relative">
                                    <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20"></div>
                                    <AlertCircle className="w-6 h-6 text-white text-bold" />
                                </div>
                                <div className="text-left">
                                    <span className="block text-[10px] text-white/60 font-bold uppercase tracking-wider">Emergency</span>
                                    <span className="block text-white font-medium tracking-wide">SOS Alert</span>
                                </div>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Search Bar */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Search className="text-gray-400 w-5 h-5 group-focus-within:text-[#1a3a1d] transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search for services, people, or help..."
                                className="w-full pl-14 pr-6 py-5 bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl shadow-sm focus:ring-1 focus:ring-gray-300 focus:bg-white/60 transition-all text-neural-dark text-lg font-light placeholder:text-gray-400 placeholder:font-light"
                            />
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h2 className="text-xl font-bold text-neural-dark mb-6 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-[#1a3a1d]" />
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
                                        <h3 className="font-medium text-neural-dark mb-1 text-lg">{action.title}</h3>
                                        <p className="text-sm text-gray-500 font-light">{action.desc}</p>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* AI Suggestions */}
                        <AiSuggestions user={user} />

                        {/* Recent Activity */}
                        <Card className="p-8 border-none bg-white/60">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-light text-neural-dark tracking-tight">Recent Activity</h2>
                                <button className="text-sm font-medium text-gray-500 hover:text-neural-dark flex items-center gap-1 transition-colors">
                                    View All <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {loadingBookings ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3a1d] mb-4"></div>
                                        <p className="font-medium">Loading activity...</p>
                                    </div>
                                ) : activeRequests.length === 0 ? (
                                    <div className="text-center py-12 bg-white/50 rounded-3xl border border-dashed border-gray-200/60">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-medium text-neural-dark">No recent activity</h3>
                                        <p className="text-gray-500 font-light mt-1">Your planned journeys and bookings will appear here.</p>
                                    </div>
                                ) : (
                                    activeRequests.map((req) => (
                                        <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/50 border border-white/60 hover:bg-white hover:shadow-md transition-all duration-300">
                                            <div className="flex items-center gap-5">
                                                <div className="bg-neural-bg p-3.5 rounded-2xl text-neural-dark shadow-sm">
                                                    <req.icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-neural-dark text-lg">{req.title}</h3>
                                                    <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500 font-light">
                                                        <span className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-md shadow-sm">
                                                            <Clock className="w-3.5 h-3.5 text-[#1a3a1d]" /> {req.date}
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
                            <h3 className="font-light text-neural-dark mb-6 text-xl tracking-tight">My Profile</h3>
                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden shadow-md">
                                    <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.firstName || 'User'}&background=random`} alt={user.firstName} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="font-medium text-neural-dark text-xl">{user.firstName || 'User'}</div>
                                    <div className="text-sm text-gray-500 font-light">{user.email || 'email@example.com'}</div>
                                </div>
                            </div>

                            <div className={`p-5 rounded-2xl border ${user.isVerified ? 'bg-[#1a3a1d]/5 border-[#1a3a1d]/10' : 'bg-yellow-50/50 border-yellow-100'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className={`w-5 h-5 ${user.isVerified ? 'text-[#1a3a1d]' : 'text-yellow-600'}`} />
                                    <span className={`font-medium text-sm ${user.isVerified ? 'text-[#1a3a1d]' : 'text-yellow-700'}`}>
                                        {user.isVerified ? 'Identity Verified' : 'Verification Pending'}
                                    </span>
                                </div>
                                <p className={`text-xs font-light leading-relaxed ${user.isVerified ? 'text-[#1a3a1d]' : 'text-yellow-600'}`}>
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
                                <BookOpen className="w-5 h-5 text-[#1a3a1d]" />
                                <h3 className="font-light text-neural-dark text-xl tracking-tight">Essential Guides</h3>
                            </div>
                            <p className="text-sm text-gray-500 mb-6 font-light">Curated for new arrivals in {user.destinationCountry || 'Australia'}.</p>

                            <div className="space-y-3">
                                {resources.map((res, idx) => (
                                    <a key={idx} href="#" className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-white/50 hover:bg-white hover:shadow-md transition-all group">
                                        <div className="bg-[#1a3a1d]/5 p-2.5 rounded-xl text-gray-400 group-hover:text-[#1a3a1d] group-hover:bg-[#1a3a1d]/10 transition-colors">
                                            <res.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-600 group-hover:text-neural-dark transition-colors">
                                            {res.title}
                                        </span>
                                        <ChevronRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-[#1a3a1d] trantision-colors" />
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
