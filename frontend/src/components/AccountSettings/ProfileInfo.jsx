import React from 'react';
import { getUserData } from '../../utils/auth';

const ProfileInfo = () => {
    const user = getUserData();

    return (
        <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-md">
                            <img
                                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.firstName || 'User'}&background=random&size=128`}
                                alt={user.firstName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full text-gray-600 shadow-md border border-gray-100 hover:text-green-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                    </div>

                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.firstName} {user.lastName}</h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                {user.email || 'email@example.com'}
                            </span>
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {user.destinationCountry || 'Australia'}
                            </span>
                        </div>

                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition shadow-sm">
                                Edit Profile
                            </button>
                            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition">
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                            <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName || ''}</div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                            <div className="text-sm font-medium text-gray-900">{user.email}</div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
                            <div className="text-sm font-medium text-gray-900">{user.phone || 'Not provided'}</div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Country of Origin</label>
                            <div className="text-sm font-medium text-gray-900">{user.countryOfOrigin || 'Not provided'}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-full text-green-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">Identity Verified</div>
                                    <div className="text-xs text-green-700">Your account is fully verified</div>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-white px-2 py-1 rounded border border-green-200">ACTIVE</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-200 rounded-full text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">Two-Factor Auth</div>
                                    <div className="text-xs text-gray-500">Add an extra layer of security</div>
                                </div>
                            </div>
                            <button className="text-xs font-semibold text-green-600 hover:underline">Enable</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;
