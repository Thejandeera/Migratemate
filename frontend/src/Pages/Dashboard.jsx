import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getUserData, isAuthenticated } from '../utils/auth';

const Dashboard = () => {
    const navigate = useNavigate();
    const user = getUserData();

    // Mock Data for UI
    const quickActions = [
        {
            title: "Book Airport Pickup",
            desc: "Get picked up safely by a verified helper",
            icon: (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            ),
            bg: "bg-green-50"
        },
        {
            title: "Find Housing",
            desc: "Browse verified housing options",
            icon: (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            bg: "bg-green-50"
        },
        {
            title: "Ask AI Assistant",
            desc: "Get instant answers to your questions",
            icon: (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            bg: "bg-green-50"
        }
    ];

    const suggestions = [
        {
            title: "Airport Pickup in Sydney",
            tag: "Recommended",
            desc: "Based on your recent arrival, you might need a safe pickup from the airport.",
            subText: `You mentioned ${user.destinationCountry || 'Australia'} as your destination`,
            action: "Book Now",
            icon: (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            )
        },
        {
            title: "Furnished Housing in Melbourne",
            tag: "Recommended",
            desc: "We found 3 verified housing options matching your preferences.",
            subText: "Housing is your listed interest",
            action: "View Options",
            icon: (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            title: "Get Your Tax File Number",
            tag: "Suggested",
            desc: "Apply for your TFN within 28 days of arrival to start working legally.",
            subText: "Essential for new migrants",
            action: "Learn How",
            icon: (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            title: "Join Australia Community",
            tag: "Suggested",
            desc: `Connect with 2,450 people from ${user.countryOfOrigin || 'your country'} already settled in ${user.destinationCountry || 'Australia'}.`,
            subText: `Your destination is ${user.destinationCountry || 'Australia'}`,
            action: "Join Now",
            icon: (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
            )
        }
    ];

    const activeRequests = [
        {
            title: "Airport Pickup",
            date: "2024-01-20 at 14:30",
            status: "Accepted",
            statusColor: "bg-green-500",
            helper: "John Smith",
            icon: (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            )
        },
        {
            title: "City Orientation Tour",
            date: "2024-01-22 at 10:00",
            status: "Pending",
            statusColor: "bg-yellow-100 text-yellow-800",
            helper: null,
            icon: (
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        }
    ];

    const resources = [
        "Getting a Tax File Number (TFN)",
        "Opening a Bank Account",
        "Understanding Medicare",
        "Public Transport Guide"
    ];

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
        }
    }, [navigate]);

    if (!isAuthenticated()) return null;

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="w-full px-4 sm:px-6 lg:px-8 py-25">
                {/* Hero Section */}
                <div className="bg-[#22C55E] rounded-2xl p-6 sm:p-10 mb-8 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                                <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.firstName || 'User'}&background=random`} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                                    Welcome to {user.destinationCountry || 'Australia'}, {user.firstName || 'User'}!
                                </h1>
                                <div className="flex items-center gap-2 text-green-100 text-sm">
                                    <span className="flex items-center gap-1 bg-green-600/30 px-2 py-0.5 rounded text-xs border border-green-400/30">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Verified
                                    </span>
                                    <span>From {user.countryOfOrigin || 'your country'}</span>
                                </div>
                            </div>
                        </div>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            SOS Emergency
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Search */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Find Members</h2>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search members by name, bio, or origin..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm"
                                />
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {quickActions.map((action, idx) => (
                                    <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
                                        <div className={`w-10 h-10 ${action.bg} rounded-lg flex items-center justify-center mb-3`}>
                                            {action.icon}
                                        </div>
                                        <h3 className="font-semibold text-gray-900 text-sm mb-1">{action.title}</h3>
                                        <p className="text-xs text-gray-500">{action.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Suggestions */}
                        <div className="bg-green-50/50 rounded-xl border border-green-100 p-6">
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="bg-green-100 p-1 rounded">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900">AI Suggestions for You</h2>
                                </div>
                                <p className="text-sm text-gray-500">Personalized recommendations based on your profile</p>
                            </div>

                            <div className="space-y-4">
                                {suggestions.map((item, idx) => (
                                    <div key={idx} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1 bg-gray-50 p-2 rounded-lg text-gray-600">
                                                {item.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                                                    <span className="text-[10px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200 uppercase tracking-wide">{item.tag}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2 leading-relaxed">{item.desc}</p>
                                                <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {item.subText}
                                                </div>
                                                <button className="text-xs font-semibold flex items-center gap-1 hover:underline">
                                                    {item.action}
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full text-center text-xs text-gray-500 mt-4 hover:text-gray-700 flex items-center justify-center gap-1">
                                View all suggestions
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </button>
                        </div>

                        {/* Active Requests */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Active Requests</h2>
                                <button className="text-sm text-[#22C55E] hover:underline flex items-center gap-1">
                                    View all
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </button>
                            </div>
                            <div className="space-y-3">
                                {activeRequests.map((req, idx) => (
                                    <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-gray-50 p-2.5 rounded-lg text-gray-600">
                                                {req.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900">{req.title}</h3>
                                                <p className="text-xs text-gray-500">{req.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {req.status === "Accepted" ? (
                                                <span className="inline-block px-2.5 py-1 rounded-full bg-green-500 text-white text-[10px] font-medium mb-1">
                                                    {req.status}
                                                </span>
                                            ) : (
                                                <span className={`inline-block px-2.5 py-1 rounded-full ${req.statusColor} text-[10px] font-medium mb-1`}>
                                                    {req.status}
                                                </span>
                                            )}

                                            {req.helper && <p className="text-[10px] text-gray-400">by {req.helper}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-8">
                        {/* Profile Card */}
                        <div className="bg-white border border-gray-100 rounded-xl p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Your Profile</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                    <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.firstName || 'User'}&background=random`} alt={user.firstName} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">{user.firstName || 'User'}</div>
                                    <div className="text-xs text-gray-500 break-all">{user.email || 'email@example.com'}</div>
                                </div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                                <div className="flex items-center gap-2 mb-1 text-green-700">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    <span className="text-xs font-semibold">Identity Verified</span>
                                </div>
                                <p className="text-[10px] text-green-600/80 leading-relaxed">
                                    Your identity has been verified. You can now book services and join the community.
                                </p>
                            </div>
                        </div>

                        {/* Helpful Resources */}
                        <div className="bg-white border border-gray-100 rounded-xl p-6">
                            <h3 className="font-semibold text-gray-900 mb-1">Helpful Resources</h3>
                            <p className="text-xs text-gray-500 mb-4">Essential info for new arrivals</p>

                            <ul className="space-y-0">
                                {resources.map((res, idx) => (
                                    <li key={idx}>
                                        <a href="#" className="flex items-center justify-between py-3 border-b border-gray-50 text-xs text-gray-700 hover:text-green-600 group transition-colors">
                                            {res}
                                            <svg className="w-3 h-3 text-gray-400 group-hover:text-green-500 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Dashboard;
