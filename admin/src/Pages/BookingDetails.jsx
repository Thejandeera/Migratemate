import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getAuthData } from '../utils/auth';
import {
    ArrowLeft, Calendar, User, Briefcase, DollarSign, CheckCircle,
    XCircle, AlertCircle, Clock, FileText, Mail, Phone, Copy, ExternalLink,
    MapPin, Shield
} from 'lucide-react';

const BookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${id}`, {
                    headers: { 'Authorization': `Bearer ${getAuthData()?.token}` }
                });
                const data = await response.json();
                if (data.success) {
                    setBooking(data.data);
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError('Failed to fetch booking details');
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [id]);

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text).then(() => {
            setNotification({ show: true, message: `${label} copied to clipboard`, type: 'success' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'ACCEPTED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'COMPLETED': return 'bg-[#1a3a1d]/10 text-emerald-800 border-[#1a3a1d]/15';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
            case 'DECLINED': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return <Clock size={16} />;
            case 'ACCEPTED': return <CheckCircle size={16} />;
            case 'COMPLETED': return <CheckCircle size={16} />;
            case 'CANCELLED': return <XCircle size={16} />;
            case 'DECLINED': return <XCircle size={16} />;
            default: return <AlertCircle size={16} />;
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col font-sans">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        </div>
    );

    if (error || !booking) return (
        <div className="min-h-screen flex flex-col font-sans">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-gray-100">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Booking</h2>
                    <p className="text-gray-600 mb-6">{error || "Booking not found"}</p>
                    <button
                        onClick={() => navigate('/bookings')}
                        className="px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-bold"
                    >
                        Back to Bookings
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen font-sans text-gray-900 pb-12">
            <Navbar />

            {/* Notification Toast */}
            {notification.show && (
                <div className="fixed top-24 right-4 z-[200] max-w-sm w-full p-4 rounded-2xl shadow-2xl backdrop-blur-md border border-white/20 bg-[#1a3a1d]/50/90 text-white transition-all duration-300 transform translate-y-0 opacity-100">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">{notification.message}</span>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
                {/* Header Section */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/bookings')}
                        className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors group font-medium"
                    >
                        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Bookings
                    </button>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Booking Details</h1>
                                <span className={`px-3 py-1 text-sm font-bold rounded-full border flex items-center gap-2 ${getStatusColor(booking.status)}`}>
                                    {getStatusIcon(booking.status)}
                                    {booking.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-500 font-medium text-sm">
                                <span
                                    className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
                                    onClick={() => copyToClipboard(booking.id, 'Booking ID')}
                                >
                                    <span className="font-mono text-xs">ID: {booking.id}</span>
                                    <Copy size={12} className="hover:text-blue-500" />
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    Created: {new Date(booking.createdAt).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white px-6 py-4 rounded-2xl shadow-lg shadow-gray-100 border border-gray-100 flex flex-col items-end min-w-[200px]">
                            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total Amount</span>
                            <div className="text-3xl font-black text-[#1a3a1d]">{booking.currency} {booking.totalAmount}</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Service Details */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
                            <div className="p-6 md:p-8 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    Service Information
                                </h2>

                                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 mb-6 hover:bg-blue-50 transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <Link
                                                to={`/gig/${booking.serviceId}`}
                                                className="text-xl font-bold text-gray-900 hover:text-blue-600 flex items-center gap-2 transition-colors mb-1"
                                            >
                                                {booking.serviceTitle}
                                                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                                            </Link>
                                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                                <span className="bg-white px-2 py-0.5 rounded border border-blue-100 text-blue-600 text-xs font-mono">
                                                    ID: {booking.serviceId}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-blue-100/50 shadow-sm">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase">Requested Date</p>
                                                <p className="font-bold text-gray-900">{new Date(booking.requestedDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-blue-100/50 shadow-sm">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                <DollarSign size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase">Price</p>
                                                <p className="font-bold text-gray-900">{booking.currency} {booking.totalAmount}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <FileText size={16} className="text-gray-400" />
                                        Additional Notes
                                    </h3>
                                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-gray-600 leading-relaxed italic">
                                        {booking.notes ? `"${booking.notes}"` : <span className="text-gray-400 not-italic">No additional notes provided.</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - User Info */}
                    <div className="space-y-6">
                        {/* Customer Card */}
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 relative z-10">
                                <User className="w-5 h-5 text-indigo-500" />
                                Customer Details
                            </h2>

                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <Link to={`/users/${booking.customerId}`}>
                                    <img
                                        src={booking.customerAvatar || `https://ui-avatars.com/api/?name=${booking.customerName}`}
                                        alt={booking.customerName}
                                        className="w-16 h-16 rounded-2xl object-cover shadow-sm border-2 border-indigo-50 group-hover:border-indigo-200 transition-colors"
                                    />
                                </Link>
                                <div>
                                    <Link to={`/users/${booking.customerId}`} className="font-bold text-gray-900 text-lg hover:text-indigo-600 transition-colors block">
                                        {booking.customerName}
                                    </Link>
                                    <div className="text-xs font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded inline-block mt-1">
                                        ID: {booking.customerId.substring(0, 8)}...
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 relative z-10">
                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl hover:bg-indigo-50/50 transition-colors group/item">
                                    <Mail size={16} className="text-gray-400 group-hover/item:text-indigo-500" />
                                    <span className="text-sm font-medium text-gray-600">{booking.customerEmail || 'Email hidden'}</span>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl hover:bg-indigo-50/50 transition-colors group/item">
                                    <Phone size={16} className="text-gray-400 group-hover/item:text-indigo-500" />
                                    <span className="text-sm font-medium text-gray-600">{booking.customerPhone || 'Phone hidden'}</span>
                                </div>
                            </div>

                            <Link
                                to={`/users/${booking.customerId}`}
                                className="mt-6 w-full py-3 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors font-bold text-sm flex items-center justify-center gap-2 relative z-10"
                            >
                                View Profile <ArrowLeft className="rotate-180 w-4 h-4" />
                            </Link>
                        </div>

                        {/* Provider Card */}
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 relative z-10">
                                <Briefcase className="w-5 h-5 text-purple-500" />
                                Provider Details
                            </h2>

                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <Link to={`/users/${booking.providerId}`}>
                                    <img
                                        src={booking.providerAvatar || `https://ui-avatars.com/api/?name=${booking.providerName}`}
                                        alt={booking.providerName}
                                        className="w-16 h-16 rounded-2xl object-cover shadow-sm border-2 border-purple-50 group-hover:border-purple-200 transition-colors"
                                    />
                                </Link>
                                <div>
                                    <Link to={`/users/${booking.providerId}`} className="font-bold text-gray-900 text-lg hover:text-purple-600 transition-colors block">
                                        {booking.providerName}
                                    </Link>
                                    <div className="text-xs font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded inline-block mt-1">
                                        ID: {booking.providerId.substring(0, 8)}...
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 relative z-10">
                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl hover:bg-purple-50/50 transition-colors group/item">
                                    <Mail size={16} className="text-gray-400 group-hover/item:text-purple-500" />
                                    <span className="text-sm font-medium text-gray-600">{booking.providerEmail || 'Email hidden'}</span>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl hover:bg-purple-50/50 transition-colors group/item">
                                    <Phone size={16} className="text-gray-400 group-hover/item:text-purple-500" />
                                    <span className="text-sm font-medium text-gray-600">{booking.providerPhone || 'Phone hidden'}</span>
                                </div>
                            </div>

                            <Link
                                to={`/users/${booking.providerId}`}
                                className="mt-6 w-full py-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors font-bold text-sm flex items-center justify-center gap-2 relative z-10"
                            >
                                View Profile <ArrowLeft className="rotate-180 w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetails;
