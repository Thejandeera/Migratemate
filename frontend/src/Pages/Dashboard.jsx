import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getUserData, isAuthenticated } from '../utils/auth';

const Dashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
        }
    }, [navigate]);

    const user = getUserData();

    if (!isAuthenticated()) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.firstName || 'User'}! 👋</h1>
                    <p className="text-gray-600">Here's what's happening in your migration journey.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg mb-4 text-blue-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Verification Status</h3>
                        <p className="text-sm text-gray-500 mt-1">Identity verification pending review.</p>
                        <div className="mt-4 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full inline-block">Pending</div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-center w-12 h-12 bg-green-50 rounded-lg mb-4 text-[#22C55E]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Marketplace Activity</h3>
                        <p className="text-sm text-gray-500 mt-1">No active listings or requests.</p>
                        <button className="mt-4 text-sm text-[#22C55E] font-medium hover:underline">Explore Marketplace</button>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-center w-12 h-12 bg-purple-50 rounded-lg mb-4 text-purple-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Community Connections</h3>
                        <p className="text-sm text-gray-500 mt-1">Connect with other migrants in {user.destinationCountry || 'your area'}.</p>
                        <button className="mt-4 text-sm text-[#22C55E] font-medium hover:underline">Find Connections</button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Complete your Profile</h2>
                    <p className="text-gray-500 mb-6 max-w-lg mx-auto">Get 5x more trust by completing your profile information and adding a bio.</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-md mx-auto mb-6">
                        <div className="bg-[#22C55E] h-2.5 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <button className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">Update Profile</button>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Dashboard;
