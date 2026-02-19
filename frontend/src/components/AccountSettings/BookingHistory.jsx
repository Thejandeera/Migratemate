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
                <Loader2 className="w-10 h-10 text-[#1a3a1d] animate-spin mb-4" />
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
                <div className="glass-card p-8 rounded-[2rem] flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Spent</p>
                        <h3 className="text-4xl font-light text-neural-dark tracking-tighter">${totalSpent.toFixed(2)}</h3>
                    </div>
                    <div className="w-14 h-14 bg-[#1a3a1d]/5 rounded-2xl flex items-center justify-center text-[#1a3a1d] group-hover:bg-[#1a3a1d] group-hover:text-white transition-colors duration-300">
                        <Receipt className="w-7 h-7" />
                    </div>
                </div>
                <div className="glass-card p-8 rounded-[2rem] flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Completed Services</p>
                        <h3 className="text-4xl font-light text-neural-dark tracking-tighter">{completedCount}</h3>
                    </div>
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <ShoppingBag className="w-7 h-7" />
                    </div>
                </div>
                <div className="glass-card p-8 rounded-[2rem] flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Active Bookings</p>
                        <h3 className="text-4xl font-light text-neural-dark tracking-tighter">{activeCount}</h3>
                    </div>
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                        <Calendar className="w-7 h-7" />
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-[2rem] overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-light text-neural-dark tracking-tight">Your Booking History</h2>

                    <div className="flex bg-gray-50 p-1 rounded-xl">
                        {['ALL', 'COMPLETED', 'CANCELLED'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === status
                                    ? 'bg-neural-dark text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
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
                                        <h3 className="font-medium text-neural-dark text-lg tracking-tight">{booking.serviceTitle}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${booking.status === 'COMPLETED' ? 'bg-[#1a3a1d]/5 text-[#1a3a1d] border border-[#1a3a1d]/10' :
                                            booking.status === 'CANCELLED' || booking.status === 'DECLINED' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                'bg-blue-50 text-blue-700 border border-blue-100'
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
