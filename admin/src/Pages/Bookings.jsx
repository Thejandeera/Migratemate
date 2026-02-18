import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthData } from '../utils/auth';
import {
    Search,
    Filter,
    MoreVertical,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    Calendar,
    Briefcase,
    FileText,
    RefreshCw,
    Eye,
    AlertCircle
} from 'lucide-react';

const STATUS_CONFIG = {
    PENDING: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', icon: Clock },
    ACCEPTED: { label: 'Accepted', bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', icon: CheckCircle },
    COMPLETED: { label: 'Completed', bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500', icon: CheckCircle },
    CANCELLED: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', icon: XCircle },
    DECLINED: { label: 'Declined', bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500', icon: XCircle },
};

const Bookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Modals
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    // Status Update
    const [newStatus, setNewStatus] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const getHeaders = () => {
        const auth = getAuthData();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.token}`
        };
    };

    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
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

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const handleDelete = async () => {
        if (!selectedBooking) return;
        setUpdatingStatus(true);
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
                showNotification('Booking deleted successfully', 'success');
            } else {
                showNotification(data.message || 'Failed to delete booking', 'error');
            }
        } catch (err) {
            console.error(err);
            showNotification('Failed to delete booking', 'error');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!selectedBooking || !newStatus) return;
        setUpdatingStatus(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${selectedBooking.id}/admin-status`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ status: newStatus })
            });
            const data = await response.json();
            if (data.success) {
                let updatedBooking = bookings.find(b => b.id === selectedBooking.id);
                if (data.data) {
                    updatedBooking = data.data;
                } else {
                    updatedBooking = { ...updatedBooking, status: newStatus };
                }

                setBookings(bookings.map(b => b.id === selectedBooking.id ? updatedBooking : b));
                setIsStatusModalOpen(false);
                setSelectedBooking(null);
                showNotification(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`, 'success');
            } else {
                showNotification(data.message || 'Failed to update status', 'error');
            }
        } catch (err) {
            console.error(err);
            showNotification('Failed to update status', 'error');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.serviceTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.providerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.id?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = statusFilter === 'ALL' || booking.status === statusFilter;

        return matchesSearch && matchesFilter;
    });

    const getStatusBadge = (status) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
        const Icon = config.icon;
        return (
            <span className={`px-2.5 py-1 inline-flex items-center gap-1.5 text-xs font-bold rounded-lg ${config.bg} ${config.text}`}>
                <Icon size={12} strokeWidth={3} />
                {config.label}
            </span>
        );
    };

    // Calculate stats
    const stats = bookings.reduce((acc, curr) => {
        acc.total++;
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, { total: 0 });

    return (
        <div className="min-h-screen font-sans text-gray-900 bg-gray-50/30">
            <Navbar />

            {/* Notification */}
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className={`fixed top-24 right-4 z-[200] max-w-sm w-full p-4 rounded-2xl shadow-2xl backdrop-blur-md border border-white/20 ${notification.type === 'success'
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-red-500/90 text-white'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-medium">{notification.message}</span>
                            <button onClick={() => setNotification({ show: false, message: '', type: '' })} className="ml-4 text-white/80 hover:text-white transition-colors">✕</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Management</h1>
                        <p className="text-gray-500">Monitor and manage all service bookings across the platform.</p>
                    </div>
                    <button
                        onClick={fetchBookings}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 hover:text-blue-600 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all font-medium"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        <span>Refresh List</span>
                    </button>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
                    <div
                        onClick={() => setStatusFilter('ALL')}
                        className={`bg-white p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${statusFilter === 'ALL' ? 'border-blue-500 ring-1 ring-blue-500 shadow-md' : 'border-gray-100 shadow-sm'}`}
                    >
                        <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">All Bookings</div>
                    </div>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <div
                            key={key}
                            onClick={() => setStatusFilter(key)}
                            className={`bg-white p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${statusFilter === key ? 'border-blue-500 ring-1 ring-blue-500 shadow-md' : 'border-gray-100 shadow-sm'}`}
                        >
                            <div className={`text-2xl font-bold mb-1 ${config.text.replace('800', '600')}`}>{stats[key] || 0}</div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">{config.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-2 mb-8 sticky top-24 z-30">
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by service, customer, provider or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-0 focus:bg-gray-100 transition-all text-gray-900 placeholder-gray-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading bookings...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-3xl text-center border border-red-100">
                        <p className="font-medium">{error}</p>
                        <button onClick={fetchBookings} className="mt-4 text-sm underline hover:text-red-700">Try Again</button>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-left">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Service & ID</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Provider</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Amount</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredBookings.map((booking) => (
                                        <motion.tr
                                            key={booking.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="group hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                                        <Briefcase size={18} />
                                                    </div>
                                                    <div>
                                                        <Link
                                                            to={`/bookings/${booking.id}`}
                                                            className="font-bold text-gray-900 hover:text-blue-600 transition-colors block mb-0.5 text-sm"
                                                        >
                                                            {booking.serviceTitle}
                                                        </Link>
                                                        <div className="text-xs text-gray-400 font-mono">
                                                            #{booking.id.substring(0, 8)}...
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link to={`/users/${booking.customerId}`} className="flex items-center gap-3 group/user">
                                                    <img
                                                        className="h-8 w-8 rounded-full border border-gray-100 group-hover/user:border-blue-200 transition-colors"
                                                        src={booking.customerAvatar || `https://ui-avatars.com/api/?name=${booking.customerName}`}
                                                        alt=""
                                                    />
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 group-hover/user:text-blue-600 transition-colors">{booking.customerName}</div>
                                                        <div className="text-xs text-gray-500">Customer</div>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link to={`/users/${booking.providerId}`} className="flex items-center gap-3 group/provider">
                                                    <img
                                                        className="h-8 w-8 rounded-full border border-gray-100 group-hover/provider:border-purple-200 transition-colors"
                                                        src={booking.providerAvatar || `https://ui-avatars.com/api/?name=${booking.providerName}`}
                                                        alt=""
                                                    />
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 group-hover/provider:text-purple-600 transition-colors">{booking.providerName}</div>
                                                        <div className="text-xs text-gray-500">Provider</div>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-900 font-medium">
                                                        <Calendar size={14} className="text-gray-400" />
                                                        {new Date(booking.requestedDate).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 w-fit">
                                                        {booking.currency} {booking.totalAmount}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(booking.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/bookings/${booking.id}`)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <div className="relative group/more">
                                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                                                            <MoreVertical size={18} />
                                                        </button>
                                                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 hidden group-hover/more:block">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedBooking(booking);
                                                                    setNewStatus(booking.status);
                                                                    setIsStatusModalOpen(true);
                                                                }}
                                                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <CheckCircle size={14} /> Update Status
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedBooking(booking);
                                                                    setIsDeleteModalOpen(true);
                                                                }}
                                                                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                            >
                                                                <Trash2 size={14} /> Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                    {filteredBookings.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-4 bg-gray-50 rounded-full">
                                                        <FileText size={24} />
                                                    </div>
                                                    <p>No bookings found matching your criteria.</p>
                                                    <button onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }} className="text-blue-600 hover:underline text-sm font-medium">Clear all filters</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Modal */}
            <AnimatePresence>
                {isStatusModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-md z-[300] flex items-center justify-center p-4"
                        onClick={() => !updatingStatus && setIsStatusModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-gray-100"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Update Status</h3>

                            <div className="space-y-2 mb-6 max-h-[60vh] overflow-y-auto">
                                {Object.keys(STATUS_CONFIG).map(status => {
                                    const config = STATUS_CONFIG[status];
                                    const Icon = config.icon;
                                    return (
                                        <button
                                            key={status}
                                            onClick={() => setNewStatus(status)}
                                            className={`w-full text-left px-4 py-3 rounded-xl border flex justify-between items-center transition-all ${newStatus === status
                                                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 text-blue-700'
                                                : 'border-gray-100 hover:bg-gray-50 text-gray-700'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg ${config.bg} ${config.text}`}>
                                                    <Icon size={16} />
                                                </div>
                                                <span className="font-medium text-sm">{config.label}</span>
                                            </div>
                                            {newStatus === status && <CheckCircle size={18} className="text-blue-500" />}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsStatusModalOpen(false)}
                                    disabled={updatingStatus}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-bold text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={updatingStatus || newStatus === selectedBooking?.status}
                                    className={`flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 ${updatingStatus || newStatus === selectedBooking?.status
                                        ? 'opacity-50 cursor-not-allowed shadow-none'
                                        : 'hover:-translate-y-0.5'
                                        }`}
                                >
                                    {updatingStatus ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <CheckCircle size={18} />
                                    )}
                                    Update
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-md z-[300] flex items-center justify-center p-4"
                        onClick={() => !updatingStatus && setIsDeleteModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-gray-100 text-center"
                        >
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Booking</h3>
                            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                                Are you sure you want to permanently delete this booking? This action cannot be undone.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    disabled={updatingStatus}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-bold text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={updatingStatus}
                                    className={`flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-200 ${updatingStatus
                                        ? 'opacity-50 cursor-not-allowed shadow-none'
                                        : 'hover:-translate-y-0.5'
                                        }`}
                                >
                                    {updatingStatus ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Trash2 size={18} />
                                    )}
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Bookings;
