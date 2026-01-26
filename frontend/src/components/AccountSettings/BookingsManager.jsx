import React, { useState } from 'react';

const BookingsManager = () => {
    const [activeTab, setActiveTab] = useState('Pending');

    const bookings = [
        {
            id: 1,
            user: {
                name: 'Amara Silva',
                avatar: 'https://ui-avatars.com/api/?name=Amara+Silva&background=random',
                verified: true
            },
            service: 'Sinhala to English Translation',
            date: '2024-01-25 at 14:00',
            amount: '40 AUD',
            message: 'Need to translate my university transcripts urgently. Can you help?',
            status: 'Pending'
        },
        // Mocking an active one?
        // { ... }
    ];

    const tabs = ['Pending', 'Active', 'Past'];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">Received Bookings</h3>
                <p className="text-sm text-gray-500">Manage bookings from customers who want your services</p>
            </div>

            <div className="flex items-center gap-2 border-b border-gray-100 pb-1">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors relative ${activeTab === tab
                                ? 'text-gray-900 bg-gray-100'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        {tab === 'Pending' && (
                            <span className="inline-flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {tab}
                                <span className="w-2 h-2 rounded-full bg-yellow-500 ml-1"></span>
                            </span>
                        )}
                        {tab === 'Active' && (
                            <span className="inline-flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                {tab}
                            </span>
                        )}
                        {tab === 'Past' && (
                            <span className="inline-flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {tab}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {bookings.filter(b => b.status === activeTab).length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500 text-sm">No {activeTab.toLowerCase()} bookings found.</p>
                    </div>
                ) : (
                    bookings.filter(b => b.status === activeTab).map((booking) => (
                        <div key={booking.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                        <img src={booking.user.avatar} alt={booking.user.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-gray-900">{booking.user.name}</h4>
                                            {booking.user.verified && (
                                                <span className="px-1.5 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold border border-green-100 rounded flex items-center gap-0.5">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                        <button className="text-xs font-semibold text-gray-500 hover:text-green-600 flex items-center gap-1 mt-0.5">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            View Profile
                                        </button>
                                        <div className="text-sm text-gray-600 mt-2 font-medium">
                                            {booking.service}
                                        </div>
                                        <div className="text-xs text-gray-400 flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {booking.date}
                                            </span>
                                            <span className="font-bold text-gray-900">{booking.amount}</span>
                                        </div>
                                    </div>
                                </div>

                                <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full border border-yellow-200 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {booking.status}
                                </span>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600 italic border border-gray-100 flex gap-2">
                                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                {booking.message}
                            </div>

                            <div className="flex gap-4">
                                <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-semibold transition shadow-sm flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    Accept
                                </button>
                                <button className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BookingsManager;
