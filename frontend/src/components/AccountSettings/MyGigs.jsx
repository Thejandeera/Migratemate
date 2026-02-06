import React, { useState, useEffect } from 'react';
import { getMyServices } from '../../utils/serviceApi';

// Category display names
const CATEGORY_NAMES = {
    'TRANSPORT': 'Transport',
    'HOUSING': 'Housing',
    'DOCUMENTATION': 'Documentation',
    'CULTURAL_SUPPORT': 'Cultural Support'
};

const MyGigs = () => {
    const [gigs, setGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mock data for views and bookings (to be replaced with real API later)
    const mockStats = {
        totalViews: 165,
        totalBookings: 31,
        viewsPerGig: () => Math.floor(Math.random() * 100) + 20,
        bookingsPerGig: () => Math.floor(Math.random() * 15) + 1
    };

    useEffect(() => {
        const fetchMyGigs = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getMyServices();
                // Add mock views and bookings to each gig
                const gigsWithMockData = data.map(gig => ({
                    ...gig,
                    views: mockStats.viewsPerGig(),
                    bookings: mockStats.bookingsPerGig()
                }));
                setGigs(gigsWithMockData);
            } catch (err) {
                console.error('Error fetching gigs:', err);
                setError(err.message || 'Failed to load your services');
            } finally {
                setLoading(false);
            }
        };

        fetchMyGigs();
    }, []);

    const stats = [
        { label: 'Active Gigs', value: gigs.length.toString(), icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color: 'bg-green-100 text-green-600' },
        { label: 'Total Views', value: mockStats.totalViews.toString(), icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', color: 'bg-yellow-100 text-yellow-600' },
        { label: 'Total Bookings', value: mockStats.totalBookings.toString(), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'bg-green-100 text-green-600' },
    ];

    // Get first image or placeholder
    const getGigImage = (gig) => {
        return gig.imageUrls?.[0] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800';
    };

    // Get location display
    const getLocation = (gig) => {
        return gig.specificLocation || gig.destination || 'Remote';
    };

    // Get price display
    const getPriceDisplay = (gig) => {
        const price = gig.price || 0;
        const currency = gig.currency || 'AUD';
        return `${price} ${currency}`;
    };

    // Get pricing unit
    const getPricingUnit = (gig) => {
        const units = {
            'FIXED': 'service',
            'HOURLY': 'hour',
            'NEGOTIABLE': 'negotiable'
        };
        return units[gig.pricingType] || 'service';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">My Service Listings</h3>
                    <p className="text-sm text-gray-500">Manage the services you offer to other migrants</p>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Create New Gig
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.color}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} /></svg>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                            <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading your services...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Failed to load services</h4>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && gigs.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No services yet</h4>
                    <p className="text-gray-500 mb-4">Create your first gig to start offering services</p>
                </div>
            )}

            {/* Gigs List */}
            {!loading && !error && gigs.length > 0 && (
                <div className="space-y-4">
                    {gigs.map((gig) => (
                        <div key={gig.id} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="w-full sm:w-48 h-32 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                                    <img
                                        src={getGigImage(gig)}
                                        alt={gig.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800';
                                        }}
                                    />
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-gray-900 line-clamp-1">{gig.title}</h4>
                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wide ${gig.available
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {gig.available ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mb-2">
                                                {CATEGORY_NAMES[gig.category] || gig.category} • {getLocation(gig)}
                                            </div>
                                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                                {gig.description}
                                            </p>
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600 p-1">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                                        <div className="font-bold text-green-600 text-sm">
                                            {getPriceDisplay(gig)}<span className="text-gray-400 font-normal text-xs">/{getPricingUnit(gig)}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                {gig.views}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                                {gig.bookings} bookings
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyGigs;
