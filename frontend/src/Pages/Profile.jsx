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
import NotificationSettings from '../components/AccountSettings/NotificationSettings';

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
        { id: 'Bookings', label: 'Bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: 'History', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'Notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'Profile': return <ProfileInfo />;
            case 'KYC': return <KYCVerification />;
            case 'MyGigs': return <MyGigs />;
            case 'Bookings': return <BookingsManager />;
            case 'History': return <BookingHistory />;
            case 'Notifications': return <NotificationSettings />;
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
                        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-0">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200
                                        ${activeTab === tab.id
                                            ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                                        }
                                    `}
                                >
                                    <svg className={`w-4 h-4 ${activeTab === tab.id ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
