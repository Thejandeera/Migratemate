import React, { useState, useEffect } from 'react';
import { getUserData } from '../../utils/auth';
import { Calendar, MapPin, Search, Filter, Loader2, AlertCircle, ShoppingBag, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BookingHistory = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const user = getUserData();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = JSON.parse(sessionStorage.getItem('migratemate_auth') || localStorage.getItem('migratemate_auth'))?.token;
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/my-bookings`, {
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
                        console.warn("Unexpected API response format in BookingHistory:", data);
                    }
                } else {
                    setError('Failed to fetch booking history');
                }
            } catch (err) {
                console.error(err);
                setError('Error loading history');
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchHistory();
    }, [user?.id]);

    const filteredBookings = (Array.isArray(bookings) ? bookings : []).filter(b =>
        filterStatus === 'ALL' ? true : b.status === filterStatus
    );

    // Calculate stats
    const totalSpent = (Array.isArray(bookings) ? bookings : [])
        .filter(b => b.status === 'COMPLETED')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const completedCount = (Array.isArray(bookings) ? bookings : []).filter(b => b.status === 'COMPLETED').length;
    const activeCount = (Array.isArray(bookings) ? bookings : []).filter(b => ['ACCEPTED', 'IN_PROGRESS', 'PENDING'].includes(b.status)).length;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm min-h-[400px]">
                <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading your history...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center text-red-600">
                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Something went wrong</h3>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Spent</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-1">${totalSpent.toFixed(2)}</h3>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                        <Receipt className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed Services</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-1">{completedCount}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Bookings</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-1">{activeCount}</h3>
                    </div>
                    <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-900">Your Booking History</h2>

                    <div className="flex bg-gray-50 p-1 rounded-xl">
                        {['ALL', 'COMPLETED', 'CANCELLED'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === status
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredBookings.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Receipt className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">No bookings found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredBookings.map((booking) => (
                            <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-900 text-lg">{booking.serviceTitle}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                            booking.status === 'CANCELLED' || booking.status === 'DECLINED' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                {new Date(booking.bookingDate).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                {booking.serviceLocation || 'Remote'}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="w-4 mr-2 text-gray-400 text-center font-bold">@</span>
                                                Provider: {booking.providerName || 'Service Provider'}
                                            </div>
                                            <div className="flex items-center text-sm font-bold text-gray-900">
                                                <span className="w-4 mr-2 text-gray-400">$</span>
                                                {booking.currency} {booking.totalAmount}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingHistory;
