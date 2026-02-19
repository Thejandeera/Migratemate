import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Footer from '../components/Footer';
import { getUserData, isAuthenticated } from '../utils/auth';

// Import Components
import ProfileInfo from '../components/AccountSettings/ProfileInfo';
import KYCVerification from '../components/AccountSettings/KYCVerification';
import MyGigs from '../components/AccountSettings/MyGigs';
import BookingsManager from '../components/AccountSettings/BookingsManager';
import BookingHistory from '../components/AccountSettings/BookingHistory';

import { User, Shield, Briefcase, Calendar, Clock, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
    const navigate = useNavigate();
    const user = getUserData();
    const [activeTab, setActiveTab] = useState('Profile');

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
        }
    }, [navigate]);

    if (!user) return null;

    const tabs = [
        { id: 'Profile', label: 'Personal Information', icon: User, desc: 'Manage your personal details' },
        { id: 'KYC', label: 'Identity Verification', icon: Shield, desc: 'Verify your identity badge' },
        { id: 'MyGigs', label: 'My Services', icon: Briefcase, desc: 'Manage services you offer' },
        { id: 'Bookings', label: 'Client Orders', icon: Calendar, desc: 'Manage incoming requests' },
        { id: 'History', label: 'Booking History', icon: Clock, desc: 'View your past bookings' },
    ];

    const renderContent = () => {
        const restrictedTabs = ['MyGigs', 'Bookings'];
        if (restrictedTabs.includes(activeTab) && !user?.isVerified) {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-[2rem] p-10 text-center max-w-2xl mx-auto mt-8 flex flex-col items-center"
                >
                    <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mb-6 border border-yellow-100/50">
                        <Lock className="w-10 h-10 text-yellow-500/80" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-3xl font-light text-neural-dark mb-3 tracking-tight">Verification Required</h3>
                    <p className="text-gray-500 mb-8 max-w-md font-light leading-relaxed">
                        To access <strong>{tabs.find(t => t.id === activeTab)?.label}</strong>, you need to verify your identity. This ensures a safe environment for everyone.
                    </p>
                    <button
                        onClick={() => setActiveTab('KYC')}
                        className="bg-neural-dark hover:bg-black text-white font-medium py-4 px-10 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-3 group"
                    >
                        <Shield className="w-5 h-5 group-hover:text-[#a7f3d0] transition-colors" />
                        <span>Start Verification</span>
                    </button>
                </motion.div>
            );
        }

        switch (activeTab) {
            case 'Profile': return <ProfileInfo />;
            case 'KYC': return <KYCVerification />;
            case 'MyGigs': return <MyGigs />;
            case 'Bookings': return <BookingsManager />;
            case 'History': return <BookingHistory />;
            default: return <ProfileInfo />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Reveal Overlay */}
            <motion.div
                initial={{ scaleY: 1 }}
                animate={{ scaleY: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                style={{ originY: 0 }}
                className="fixed inset-0 z-50 bg-[#1a3a1d]"
            />


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Navigation */}
                    <div className="lg:w-80 flex-shrink-0">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-2 sticky top-28">
                            <div className="p-4 mb-2">
                                <h2 className="text-2xl font-light text-neural-dark tracking-tight">Settings</h2>
                                <p className="text-sm text-gray-500 font-light">Manage your account</p>
                            </div>

                            <nav className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200 group ${activeTab === tab.id
                                                ? 'bg-[#1a3a1d]/5 text-[#1a3a1d] shadow-sm ring-1 ring-black/5'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-xl transition-colors ${activeTab === tab.id ? 'bg-white text-[#1a3a1d] shadow-sm ring-1 ring-gray-100' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-gray-700'
                                            }`}>
                                            <tab.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="block font-medium text-sm">{tab.label}</span>
                                            <span className={`text-xs block ${activeTab === tab.id ? 'text-[#1a3a1d]/70' : 'text-gray-400 font-light'}`}>{tab.desc}</span>
                                        </div>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        <div className="glass-card rounded-[2rem] min-h-[600px] p-8 sm:p-10">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h1 className="text-4xl font-light text-neural-dark tracking-tight mb-2">{tabs.find(t => t.id === activeTab)?.label}</h1>
                                    <p className="text-gray-500 text-sm font-light">
                                        {tabs.find(t => t.id === activeTab)?.desc}
                                    </p>
                                </div>
                                <div id="profile-header-actions" className="flex items-center gap-3"></div>
                            </div>

                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderContent()}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Profile;
