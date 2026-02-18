import React, { useState, useEffect } from 'react';
import { getUserData } from '../../utils/auth';
import { Calendar, Clock, MapPin, Check, X, MessageCircle, Phone, User, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BookingsManager = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('PENDING'); // PENDING, ACTIVE, COMPLETED
    const user = getUserData();

    const fetchBookings = async () => {
        try {
            const token = JSON.parse(sessionStorage.getItem('migratemate_auth') || localStorage.getItem('migratemate_auth'))?.token;
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/provider-requests`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    setBookings(data);
                } else if (data && Array.isArray(data.data)) {
                    setBookings(data.data);
                } else {
                    setBookings([]);
                    console.warn("Unexpected API response format in BookingsManager:", data);
                }
            } else {
                setError('Failed to fetch bookings');
            }
        } catch (err) {
            console.error(err);
            setError('Error loading bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) fetchBookings();
    }, [user?.id]);

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            const token = JSON.parse(sessionStorage.getItem('migratemate_auth') || localStorage.getItem('migratemate_auth'))?.token;

            // Optimistic update
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${bookingId}/status?status=${newStatus}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // Revert if failed
                fetchBookings();
                alert('Failed to update booking status');
            }
        } catch (err) {
            console.error(err);
            fetchBookings();
        }
    };

    const filteredBookings = (Array.isArray(bookings) ? bookings : []).filter(b => {
        if (activeTab === 'PENDING') return b.status === 'PENDING';
        if (activeTab === 'ACTIVE') return b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS';
        if (activeTab === 'COMPLETED') return b.status === 'COMPLETED' || b.status === 'CANCELLED' || b.status === 'DECLINED';
        return true;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm min-h-[400px]">
                <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading incoming requests...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center text-red-600">
                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Something went wrong</h3>
                <p>{error}</p>
                <button
                    onClick={fetchBookings}
                    className="mt-4 px-6 py-2 bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors font-medium shadow-sm"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const tabs = [
        { id: 'PENDING', label: 'Requests', count: (Array.isArray(bookings) ? bookings : []).filter(b => b.status === 'PENDING').length },
        { id: 'ACTIVE', label: 'Active', count: (Array.isArray(bookings) ? bookings : []).filter(b => ['ACCEPTED', 'IN_PROGRESS'].includes(b.status)).length },
        { id: 'COMPLETED', label: 'History', count: (Array.isArray(bookings) ? bookings : []).filter(b => ['COMPLETED', 'CANCELLED', 'DECLINED'].includes(b.status)).length }
    ];

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Booking Requests</h2>
                    <p className="text-gray-500 mt-1">Manage incoming jobs and meaningful connections</p>
                </div>

                <div className="flex p-1 bg-gray-100 rounded-xl">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === tab.id
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {filteredBookings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        {activeTab === 'PENDING'
                            ? "You're all caught up! No new requests pending."
                            : activeTab === 'ACTIVE'
                                ? "No jobs currently in progress."
                                : "No past booking history available."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence>
                        {filteredBookings.map((booking) => (
                            <motion.div
                                key={booking.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="p-6 flex flex-col md:flex-row gap-6">
                                    {/* User Info & Service Date */}
                                    <div className="flex-shrink-0 flex md:flex-col items-center md:items-start gap-4 md:w-48">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                                                {booking.customerAvatar ? (
                                                    <img src={booking.customerAvatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-6 h-6 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{booking.customerName || 'Guest User'}</p>
                                                <p className="text-xs text-gray-500">Customer</p>
                                            </div>
                                        </div>

                                        <div className="mt-2 text-sm text-gray-600 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-green-600" />
                                                <span className="font-medium">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-green-600" />
                                                <span>{booking.timeSlot || 'Flexible Time'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Service Details */}
                                    <div className="flex-1 border-l border-gray-100 pl-0 md:pl-6 pt-4 md:pt-0 border-t md:border-t-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">{booking.serviceTitle}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                booking.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-700' :
                                                    booking.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700' :
                                                        booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                            'bg-red-100 text-red-700'
                                                }`}>
                                                {booking.status.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <div className="flex items-center text-sm text-gray-500 mb-4">
                                            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                            {booking.serviceLocation || 'Remote / Online'}
                                        </div>

                                        {booking.notes && (
                                            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic mb-4 border border-gray-100">
                                                "{booking.notes}"
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4">
                                            <div className="text-lg font-bold text-gray-900">
                                                {booking.currency} {booking.totalAmount}
                                            </div>
                                            {['ACCEPTED', 'IN_PROGRESS'].includes(booking.status) && (
                                                <div className="flex items-center gap-2">
                                                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Message Customer">
                                                        <MessageCircle className="w-5 h-5" />
                                                    </button>
                                                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Call Customer">
                                                        <Phone className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-row md:flex-col gap-2 justify-end md:justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                        {booking.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.id, 'ACCEPTED')}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-bold shadow-md hover:shadow-lg"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.id, 'DECLINED')}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Decline
                                                </button>
                                            </>
                                        )}

                                        {booking.status === 'ACCEPTED' && (
                                            <button
                                                onClick={() => handleStatusUpdate(booking.id, 'IN_PROGRESS')}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold shadow-md"
                                            >
                                                Start Job
                                            </button>
                                        )}

                                        {booking.status === 'IN_PROGRESS' && (
                                            <button
                                                onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-bold shadow-md"
                                            >
                                                <Check className="w-4 h-4" />
                                                Complete
                                            </button>
                                        )}

                                        {['COMPLETED', 'DECLINED', 'CANCELLED'].includes(booking.status) && (
                                            <span className="text-xs text-center text-gray-400 font-medium px-2">
                                                {new Date(booking.updatedAt || Date.now()).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default BookingsManager;
