import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getUserData, isAuthenticated } from '../utils/auth';

// Import Components
import ProfileInfo from '../components/AccountSettings/ProfileInfo';
import KYCVerification from '../components/AccountSettings/KYCVerification';
import MyGigs from '../components/AccountSettings/MyGigs';
import BookingsManager from '../components/AccountSettings/BookingsManager';
import BookingHistory from '../components/AccountSettings/BookingHistory';


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
        { id: 'Profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { id: 'KYC', label: 'KYC', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
        { id: 'MyGigs', label: 'My Gigs', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { id: 'Bookings', label: 'Client Orders', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: 'History', label: 'My Bookings', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },

    ];

    const renderContent = () => {
        const restrictedTabs = ['MyGigs', 'Bookings'];
        if (restrictedTabs.includes(activeTab) && !user?.isVerified) {
            return (
                <div className="bg-white border border-yellow-200 rounded-2xl p-8 text-center shadow-sm max-w-2xl mx-auto mt-8">
                    <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Verification Required</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        To access <strong>{tabs.find(t => t.id === activeTab)?.label}</strong>, you need to verify your identity first. This helps us prioritize safety and trust in our community.
                    </p>
                    <button
                        onClick={() => setActiveTab('KYC')}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm inline-flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Complete Verification
                    </button>
                </div>
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
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="w-full px-4 sm:px-6 lg:px-8 py-24">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                        <p className="text-gray-500 mt-1">Manage your profile, gigs, bookings, and preferences</p>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="bg-gray-50/80 backdrop-blur-sm sticky top-20 z-10 border border-gray-100 rounded-2xl p-2 mb-8 shadow-sm">
                        <div className="flex gap-1 overflow-x-auto pb-2 justify-start md:justify-center touch-pan-x" role="tablist" aria-label="Account Settings Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    role="tab"
                                    aria-selected={activeTab === tab.id}
                                    aria-controls={`panel-${tab.id}`}
                                    id={`tab-${tab.id}`}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0
                                        ${activeTab === tab.id
                                            ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                                        }
                                    `}
                                >
                                    <svg className={`w-4 h-4 ${activeTab === tab.id ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                                    </svg>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="animate-fadeIn">
                        {renderContent()}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Profile;
