import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthData } from '../utils/auth';

const STATUS_CONFIG = {
    INREVIEW: { label: 'In Review', bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
    APPROVED: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    REJECTED: { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
    ADVICED: { label: 'Adviced', bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
};

const CATEGORY_NAMES = {
    'TRANSPORT': 'Transport',
    'HOUSING': 'Housing',
    'DOCUMENTATION': 'Documentation',
    'CULTURAL_SUPPORT': 'Cultural Support',
    'FINANCIAL': 'Financial',
    'HEALTHCARE': 'Healthcare',
    'EDUCATION': 'Education',
    'LEGAL': 'Legal',
    'EMPLOYMENT': 'Employment',
    'OTHER': 'Other',
};

const ManageGigs = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [updatingId, setUpdatingId] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ show: false, serviceId: null, serviceTitle: '', reason: '', customReason: '', loading: false });

    const DELETE_REASONS = [
        'Violation of terms of service',
        'Inappropriate or offensive content',
        'Duplicate listing',
        'Fraudulent or misleading information',
        'Inactive or unresponsive provider',
        'Other'
    ];

    const getHeaders = () => {
        const auth = getAuthData();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.token}`
        };
    };

    const fetchServices = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/services/admin/all`, {
                headers: getHeaders()
            });
            const data = await response.json();
            if (data.success) {
                setServices(data.data);
            } else {
                setError(data.message || 'Failed to fetch services');
            }
        } catch (err) {
            setError('Failed to fetch services. Ensure the server is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleStatusUpdate = async (serviceId, newStatus) => {
        setUpdatingId(serviceId);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/services/admin/${serviceId}/status`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ status: newStatus })
            });
            const data = await response.json();
            if (data.success) {
                setServices(services.map(s => s.id === serviceId ? { ...s, status: newStatus } : s));
                showNotification(`Service status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`, 'success');
            } else {
                showNotification(data.message || 'Failed to update status', 'error');
            }
        } catch (err) {
            console.error(err);
            showNotification('Failed to update service status', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const openDeleteModal = (service) => {
        setDeleteModal({ show: true, serviceId: service.id, serviceTitle: service.title, reason: '', customReason: '', loading: false });
    };

    const handleDeleteService = async () => {
        const reason = deleteModal.reason === 'Other' ? deleteModal.customReason : deleteModal.reason;
        if (!reason.trim()) {
            showNotification('Please select or enter a reason', 'error');
            return;
        }
        setDeleteModal(prev => ({ ...prev, loading: true }));
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/services/admin/${deleteModal.serviceId}`, {
                method: 'DELETE',
                headers: getHeaders(),
                body: JSON.stringify({ reason })
            });
            const data = await response.json();
            if (data.success) {
                setServices(services.filter(s => s.id !== deleteModal.serviceId));
                showNotification('Service deleted and provider notified via email', 'success');
                setDeleteModal({ show: false, serviceId: null, serviceTitle: '', reason: '', customReason: '', loading: false });
            } else {
                showNotification(data.message || 'Failed to delete service', 'error');
                setDeleteModal(prev => ({ ...prev, loading: false }));
            }
        } catch (err) {
            console.error(err);
            showNotification('Failed to delete service', 'error');
            setDeleteModal(prev => ({ ...prev, loading: false }));
        }
    };

    const filteredServices = services.filter(service => {
        const matchesSearch = searchTerm === '' ||
            service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.providerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.id?.toLowerCase().includes(searchTerm.toLowerCase());

        const serviceStatus = service.status || 'INREVIEW';
        const matchesStatus = filterStatus === 'all' || serviceStatus === filterStatus;
        const matchesCategory = filterCategory === 'all' || service.category === filterCategory;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    const getStatusBadge = (status) => {
        const config = STATUS_CONFIG[status || 'INREVIEW'] || STATUS_CONFIG.INREVIEW;
        return (
            <span className={`px-2.5 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
                {config.label}
            </span>
        );
    };

    // Count services by status for quick stats
    const statusCounts = services.reduce((acc, s) => {
        const status = s.status || 'INREVIEW';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Notification */}
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className={`fixed top-20 right-4 left-4 md:left-auto md:right-6 p-4 rounded-xl shadow-2xl z-[200] text-white backdrop-blur-sm ${notification.type === 'success'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                            : 'bg-gradient-to-r from-red-500 to-pink-600'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span>{notification.message}</span>
                            <button
                                onClick={() => setNotification({ show: false, message: '', type: '' })}
                                className="ml-4 text-white/80 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto py-6 px-3 sm:px-4 lg:px-6 pt-24">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                Manage Gigs
                            </h1>
                            <p className="text-gray-600">
                                Review, approve, and manage all service listings
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={fetchServices}
                                className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium text-sm flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Status Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                        <div
                            onClick={() => setFilterStatus('all')}
                            className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md ${filterStatus === 'all' ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-100'}`}
                        >
                            <div className="text-2xl font-bold text-gray-900">{services.length}</div>
                            <div className="text-xs text-gray-500 uppercase font-semibold mt-1">Total</div>
                        </div>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <div
                                key={key}
                                onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
                                className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md ${filterStatus === key ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-100'}`}
                            >
                                <div className="text-2xl font-bold text-gray-900">{statusCounts[key] || 0}</div>
                                <div className={`text-xs uppercase font-semibold mt-1 ${config.text}`}>{config.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search by title, provider, or ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900"
                                >
                                    <option value="all">All Status</option>
                                    <option value="INREVIEW">In Review</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="REJECTED">Rejected</option>
                                    <option value="ADVICED">Adviced</option>
                                </select>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900"
                                >
                                    <option value="all">All Categories</option>
                                    {Object.entries(CATEGORY_NAMES).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Services Table */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mb-4"></div>
                        <p className="text-gray-600">Loading services...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Service
                                        </th>
                                        <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Provider
                                        </th>
                                        <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="hidden lg:table-cell px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredServices.map((service) => (
                                        <motion.tr
                                            key={service.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-12 w-12">
                                                        {service.imageUrls && service.imageUrls.length > 0 ? (
                                                            <img
                                                                src={service.imageUrls[0]}
                                                                alt={service.title}
                                                                className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                                                            />
                                                        ) : (
                                                            <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-3 sm:ml-4">
                                                        <div
                                                            className="text-sm font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                                                            onClick={() => navigate(`/gig/${service.id}`)}
                                                        >
                                                            {service.title}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {new Date(service.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{service.providerName}</div>
                                                <div className="text-xs text-gray-500">{service.origin} → {service.destination}</div>
                                            </td>
                                            <td className="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                                                    {CATEGORY_NAMES[service.category] || service.category}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(service.status)}
                                            </td>
                                            <td className="hidden lg:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {service.currency} {service.price}
                                                </div>
                                                <div className="text-xs text-gray-500 capitalize">{service.pricingType?.toLowerCase()}</div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end flex-wrap gap-1.5">
                                                    {/* View */}
                                                    <button
                                                        onClick={() => navigate(`/gig/${service.id}`)}
                                                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                        title="View Details"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    {/* Approve */}
                                                    {service.status !== 'APPROVED' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(service.id, 'APPROVED')}
                                                            disabled={updatingId === service.id}
                                                            className={`p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all ${updatingId === service.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            title="Approve"
                                                        >
                                                            {updatingId === service.id ? (
                                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    )}
                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => openDeleteModal(service)}
                                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                    {/* Advice */}
                                                    {service.status !== 'ADVICED' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(service.id, 'ADVICED')}
                                                            disabled={updatingId === service.id}
                                                            className={`p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all ${updatingId === service.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            title="Advice"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredServices.length === 0 && (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="mt-4 text-gray-500">
                                        {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                                            ? 'No services match your filters'
                                            : 'No services found'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Reason Modal */}
            <AnimatePresence>
                {deleteModal.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
                        onClick={() => !deleteModal.loading && setDeleteModal({ show: false, serviceId: null, serviceTitle: '', reason: '', customReason: '', loading: false })}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Delete Service</h3>
                                    <p className="text-sm text-gray-500 line-clamp-1">{deleteModal.serviceTitle}</p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-4">
                                This will permanently delete the service and send an email notification to the provider with the reason.
                            </p>

                            <div className="space-y-2 mb-4">
                                <label className="text-sm font-semibold text-gray-700">Select a reason</label>
                                {DELETE_REASONS.map((reason) => (
                                    <label
                                        key={reason}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${deleteModal.reason === reason
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="deleteReason"
                                            value={reason}
                                            checked={deleteModal.reason === reason}
                                            onChange={(e) => setDeleteModal(prev => ({ ...prev, reason: e.target.value, customReason: '' }))}
                                            className="w-4 h-4 text-red-600 focus:ring-red-500"
                                        />
                                        <span className="text-sm text-gray-700">{reason}</span>
                                    </label>
                                ))}
                            </div>

                            {deleteModal.reason === 'Other' && (
                                <div className="mb-4">
                                    <textarea
                                        value={deleteModal.customReason}
                                        onChange={(e) => setDeleteModal(prev => ({ ...prev, customReason: e.target.value }))}
                                        placeholder="Enter the reason for deletion..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm text-gray-900 placeholder-gray-400 resize-none"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteModal({ show: false, serviceId: null, serviceTitle: '', reason: '', customReason: '', loading: false })}
                                    disabled={deleteModal.loading}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteService}
                                    disabled={deleteModal.loading || !deleteModal.reason || (deleteModal.reason === 'Other' && !deleteModal.customReason.trim())}
                                    className={`flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center justify-center gap-2 ${deleteModal.loading || !deleteModal.reason || (deleteModal.reason === 'Other' && !deleteModal.customReason.trim())
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                        }`}
                                >
                                    {deleteModal.loading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    )}
                                    Delete Service
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageGigs;
