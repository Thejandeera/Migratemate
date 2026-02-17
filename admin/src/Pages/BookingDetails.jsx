import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getAuthData } from '../utils/auth';
import {
    ArrowLeft, Calendar, User, Briefcase, DollarSign, CheckCircle,
    XCircle, AlertCircle, Clock, FileText, Mail, Phone
} from 'lucide-react';

const BookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'ACCEPTED': return 'bg-blue-100 text-blue-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            case 'DECLINED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
    if (!booking) return <div className="min-h-screen flex items-center justify-center">Booking not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />
            <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 pt-24">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors">
                    <ArrowLeft size={20} className="mr-2" /> Back
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-50 px-8 py-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-gray-900">Booking #{booking.id.substring(0, 8)}</h1>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(booking.status)}`}>
                                    {booking.status}
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm">Created on {new Date(booking.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 uppercase font-semibold">Total Amount</p>
                            <p className="text-3xl font-bold text-green-600">{booking.currency} {booking.totalAmount}</p>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Service Info */}
                        <div className="md:col-span-2">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <Briefcase className="mr-2 text-blue-500" size={20} /> Service Details
                            </h2>
                            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                                <h3 className="text-xl font-bold text-blue-900 mb-2">{booking.serviceTitle}</h3>
                                <div className="flex items-center text-blue-800 mb-4">
                                    <Calendar size={18} className="mr-2 opacity-70" />
                                    Requested Date: <span className="font-semibold ml-1">{new Date(booking.requestedDate).toLocaleDateString()}</span>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-blue-100">
                                    <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Notes</p>
                                    <p className="text-gray-700">{booking.notes || 'No additonal notes provided.'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Customer Card */}
                        <Link to={`/users/${booking.customerId}`} className="group relative block">
                            <div className="absolute inset-0 bg-indigo-50 rounded-xl transform transition-transform group-hover:scale-[1.02] duration-300"></div>
                            <div className="relative bg-white rounded-xl p-6 border border-gray-200 shadow-sm transition-all group-hover:shadow-md h-full">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <User className="mr-2 text-indigo-500" size={20} /> Customer
                                </h2>
                                <div className="flex items-center mb-4">
                                    <img
                                        src={booking.customerAvatar || `https://ui-avatars.com/api/?name=${booking.customerName}`}
                                        alt=""
                                        className="w-16 h-16 rounded-full border-2 border-indigo-100 mr-4 object-cover"
                                    />
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                                            {booking.customerName}
                                        </h3>
                                        <p className="text-xs text-gray-500">ID: {booking.customerId}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <Mail size={16} className="mr-3 text-gray-400" />
                                        {booking.customerEmail || 'Email hidden'}
                                    </div>
                                    <div className="flex items-center">
                                        <Phone size={16} className="mr-3 text-gray-400" />
                                        {booking.customerPhone || 'Phone hidden'}
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Provider Card */}
                        <Link to={`/users/${booking.providerId}`} className="group relative block">
                            <div className="absolute inset-0 bg-purple-50 rounded-xl transform transition-transform group-hover:scale-[1.02] duration-300"></div>
                            <div className="relative bg-white rounded-xl p-6 border border-gray-200 shadow-sm transition-all group-hover:shadow-md h-full">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <Briefcase className="mr-2 text-purple-500" size={20} /> Provider
                                </h2>
                                <div className="flex items-center mb-4">
                                    <img
                                        src={booking.providerAvatar || `https://ui-avatars.com/api/?name=${booking.providerName}`}
                                        alt=""
                                        className="w-16 h-16 rounded-full border-2 border-purple-100 mr-4 object-cover"
                                    />
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors">
                                            {booking.providerName}
                                        </h3>
                                        <p className="text-xs text-gray-500">ID: {booking.providerId}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <Mail size={16} className="mr-3 text-gray-400" />
                                        {booking.providerEmail || 'Email hidden'}
                                    </div>
                                    <div className="flex items-center">
                                        <Phone size={16} className="mr-3 text-gray-400" />
                                        {booking.providerPhone || 'Phone hidden'}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetails;
