import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthData } from '../utils/auth';
import {
    Search, Filter, MoreVertical, Trash2, CheckCircle, XCircle,
    Clock, DollarSign, Calendar, User, Briefcase, FileText
} from 'lucide-react';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    const getHeaders = () => {
        const auth = getAuthData();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.token}`
        };
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/all`, {
                headers: getHeaders()
            });
            const data = await response.json();
            if (data.success) {
                setBookings(data.data);
            } else {
                setError(data.message || 'Failed to fetch bookings');
            }
        } catch (err) {
            setError('Network error. Ensure server is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleDelete = async () => {
        if (!selectedBooking) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${selectedBooking.id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            const data = await response.json();
            if (data.success) {
                setBookings(bookings.filter(b => b.id !== selectedBooking.id));
                setIsDeleteModalOpen(false);
                setSelectedBooking(null);
            } else {
                alert('Failed to delete: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to delete booking');
        }
    };

    const handleStatusUpdate = async () => {
        if (!selectedBooking || !newStatus) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${selectedBooking.id}/admin-status`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ status: newStatus })
            });
            const data = await response.json();
            if (data.success) {
                setBookings(bookings.map(b => b.id === selectedBooking.id ? data.data : b));
                setIsStatusModalOpen(false);
                setSelectedBooking(null);
            } else {
                alert('Failed to update status: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = statusFilter === 'ALL' || booking.status === statusFilter;

        return matchesSearch && matchesFilter;
    });

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

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-24">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Booking Management</h1>
                    <p className="text-gray-600">Monitor and manage all service bookings.</p>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search bookings..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                        {['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service & ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredBookings.map((booking) => (
                                        <motion.tr
                                            key={booking.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{booking.serviceTitle}</div>
                                                <div className="text-xs text-gray-500 font-mono mt-1">{booking.id.substring(0, 8)}...</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    {booking.customerAvatar ? (
                                                        <img src={booking.customerAvatar} alt="" className="h-8 w-8 rounded-full mr-3" />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-600 text-xs font-bold">
                                                            {booking.customerName?.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                                                        {booking.customerEmail && <div className="text-xs text-gray-500">{booking.customerEmail}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    {booking.providerAvatar ? (
                                                        <img src={booking.providerAvatar} alt="" className="h-8 w-8 rounded-full mr-3" />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 text-purple-600 text-xs font-bold">
                                                            {booking.providerName?.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{booking.providerName}</div>
                                                        {booking.providerEmail && <div className="text-xs text-gray-500">{booking.providerEmail}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-900 flex items-center">
                                                        <Calendar size={14} className="mr-1 text-gray-400" />
                                                        {new Date(booking.requestedDate).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-sm font-semibold text-green-600 mt-1">
                                                        {booking.currency} {booking.totalAmount}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedBooking(booking);
                                                            setNewStatus(booking.status);
                                                            setIsStatusModalOpen(true);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                                        title="Change Status"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedBooking(booking);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                                                        title="Delete Booking"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredBookings.length === 0 && (
                                <div className="p-12 text-center text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                    No bookings found matching your criteria.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Status Modal */}
            {isStatusModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsStatusModalOpen(false)}></div>
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative z-10 p-6">
                            <h3 className="text-lg font-bold mb-4">Update Booking Status</h3>
                            <div className="space-y-2 mb-6">
                                {['PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED', 'DECLINED'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setNewStatus(status)}
                                        className={`w-full text-left px-4 py-3 rounded-lg border flex justify-between items-center ${newStatus === status
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="font-medium">{status}</span>
                                        {newStatus === status && <CheckCircle size={18} />}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsStatusModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleStatusUpdate}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                >
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-sm relative z-10 p-6 text-center">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Delete Booking?</h3>
                            <p className="text-gray-600 text-sm mb-6">
                                Are you sure you want to delete this booking? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg w-full"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium w-full"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bookings;
