import React, { useState, useEffect } from 'react';
import { getMyServices } from '../../utils/serviceApi';
import CreateGigForm from './CreateGigForm';

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
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [editGig, setEditGig] = useState(null);

    // Mock data for views and bookings To be implemented with booking system
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
                    available: gig.available ?? gig.isAvailable ?? true,
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

    const handleGigCreated = (gig, isUpdate = false) => {
        if (isUpdate) {
            setGigs(prev => prev.map(g =>
                g.id === gig.id ? { ...gig, views: g.views, bookings: g.bookings } : g
            ));
        } else {
            setGigs(prev => [{
                ...gig,
                views: mockStats.viewsPerGig(),
                bookings: mockStats.bookingsPerGig()
            }, ...prev]);
        }
        setEditGig(null);
    };

    const stats = [
        { label: 'Active Gigs', value: gigs.length.toString(), icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color: 'bg-green-100 text-green-600' },
        { label: 'Total Views', value: mockStats.totalViews.toString(), icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', color: 'bg-yellow-100 text-yellow-600' },
        { label: 'Total Bookings', value: mockStats.totalBookings.toString(), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'bg-green-100 text-green-600' },
    ];

    const getGigImage = (gig) => {
        return gig.imageUrls?.[0] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800';
    };

    const getLocation = (gig) => {
        return gig.specificLocation || gig.destination || 'Remote';
    };

    const getPriceDisplay = (gig) => {
        const price = gig.price || 0;
        const currency = gig.currency || 'AUD';
        return `${price} ${currency}`;
    };

    const getPricingUnit = (gig) => {
        const units = {
            'FIXED': 'service',
            'HOURLY': 'hour',
            'NEGOTIABLE': 'negotiable'
        };
        return units[gig.pricingType] || 'service';
    };

    const toggleMenu = (gigId) => {
        setOpenMenuId(openMenuId === gigId ? null : gigId);
    };

    const closeMenu = () => setOpenMenuId(null);

    const handleUpdate = (gig) => {
        setEditGig(gig);
        setShowCreateForm(true);
        setOpenMenuId(null);
    };

    const handleDelete = async (gigId) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;

        try {
            let token = null;
            try {
                const authData = JSON.parse(sessionStorage.getItem('migratemate_auth') || localStorage.getItem('migratemate_auth'));
                token = authData?.token;
            } catch (e) {
                console.error("Error parsing auth data", e);
            }

            const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
            const response = await fetch(`${API_URL}/services/${gigId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setGigs(prev => prev.filter(g => g.id !== gigId));
            } else {
                alert('Failed to delete service');
            }
        } catch (err) {
            console.error('Error deleting service:', err);
            alert('Failed to delete service');
        }
        setOpenMenuId(null);
    };

    // Handle Toggle Active
    const handleToggle = async (gig) => {
        try {
            let token = null;
            try {
                const authData = JSON.parse(sessionStorage.getItem('migratemate_auth') || localStorage.getItem('migratemate_auth'));
                token = authData?.token;
            } catch (e) {
                console.error("Error parsing auth data", e);
            }

            const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
            const response = await fetch(`${API_URL}/services/${gig.id}/toggle`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok && data.success) {
                // API returns isAvailable, but we use available in the UI
                const newAvailableStatus = data.data.isAvailable ?? data.data.available;
                setGigs(prev => prev.map(g =>
                    g.id === gig.id ? { ...g, available: newAvailableStatus, isAvailable: newAvailableStatus } : g
                ));
            } else {
                alert('Failed to toggle service status');
            }
        } catch (err) {
            console.error('Error toggling service:', err);
            alert('Failed to toggle service status');
        }
        setOpenMenuId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">My Service Listings</h3>
                    <p className="text-sm text-gray-500">Manage the services you offer to other migrants</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
                >
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
                                        <div className="relative">
                                            <button
                                                onClick={() => toggleMenu(gig.id)}
                                                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                            </button>

                                            {/* Dropdown Menu */}
                                            {openMenuId === gig.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={closeMenu}
                                                    />
                                                    <div className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                                                        <button
                                                            onClick={() => handleUpdate(gig)}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                            Update
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggle(gig)}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                                            {gig.available ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(gig.id)}
                                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
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

            {/* Create/Edit Gig Modal */}
            <CreateGigForm
                isOpen={showCreateForm}
                onClose={() => {
                    setShowCreateForm(false);
                    setEditGig(null);
                }}
                onSuccess={handleGigCreated}
                editGig={editGig}
            />
        </div>
    );
};

export default MyGigs;
