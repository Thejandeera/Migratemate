import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthData } from '../utils/auth';
import {
    Search,
    Filter,
    RefreshCw,
    Eye,
    Trash2,
    CheckCircle,
    AlertTriangle,
    Truck,
    Home,
    FileText,
    Globe,
    DollarSign,
    Heart,
    BookOpen,
    Scale,
    Briefcase,
    HelpCircle,
    MoreVertical,
    MapPin,
    Calendar
} from 'lucide-react';

const STATUS_CONFIG = {
    INREVIEW: { label: 'In Review', bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', icon: AlertTriangle },
    APPROVED: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', icon: CheckCircle },
    ADVICED: { label: 'Adviced', bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', icon: HelpCircle },
};

const CATEGORY_ICONS = {
    'TRANSPORT': Truck,
    'HOUSING': Home,
    'DOCUMENTATION': FileText,
    'CULTURAL_SUPPORT': Globe,
    'FINANCIAL': DollarSign,
    'HEALTHCARE': Heart,
    'EDUCATION': BookOpen,
    'LEGAL': Scale,
    'EMPLOYMENT': Briefcase,
    'OTHER': HelpCircle,
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
    const [adviceModal, setAdviceModal] = useState({ show: false, serviceId: null, serviceTitle: '', reason: '', customReason: '', loading: false });

    const DELETE_REASONS = [
        'Violation of terms of service',
        'Inappropriate or offensive content',
        'Duplicate listing',
        'Fraudulent or misleading information',
        'Inactive or unresponsive provider',
        'Other'
    ];

    const ADVICE_REASONS = [
        'Incomplete or unclear service description',
        'Pricing information needs to be updated',
        'Service images are missing or low quality',
        'Contact information is incomplete',
        'Service category is incorrect',
        'Service details do not match our guidelines',
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

    const openAdviceModal = (service) => {
        setAdviceModal({ show: true, serviceId: service.id, serviceTitle: service.title, reason: '', customReason: '', loading: false });
    };

    const handleAdviceService = async () => {
        const reason = adviceModal.reason === 'Other' ? adviceModal.customReason : adviceModal.reason;
        if (!reason.trim()) {
            showNotification('Please select or enter a reason', 'error');
            return;
        }
        setAdviceModal(prev => ({ ...prev, loading: true }));
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/services/admin/${adviceModal.serviceId}/status`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ status: 'ADVICED', reason })
            });
            const data = await response.json();
            if (data.success) {
                setServices(services.map(s => s.id === adviceModal.serviceId ? { ...s, status: 'ADVICED' } : s));
                showNotification('Advice sent and provider notified via email', 'success');
                setAdviceModal({ show: false, serviceId: null, serviceTitle: '', reason: '', customReason: '', loading: false });
            } else {
                showNotification(data.message || 'Failed to send advice', 'error');
                setAdviceModal(prev => ({ ...prev, loading: false }));
            }
        } catch (err) {
            console.error(err);
            showNotification('Failed to send advice', 'error');
            setAdviceModal(prev => ({ ...prev, loading: false }));
        }
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
        const StatusIcon = config.icon;
        return (
            <span className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs font-bold rounded-full border ${config.bg} ${config.text} border-current border-opacity-20`}>
                <StatusIcon size={12} strokeWidth={3} />
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
        <div className="min-h-screen font-sans text-gray-900">
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

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 pt-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Gigs</h1>
                        <p className="text-gray-500">Review, approve, and manage all service listings</p>
                    </div>
                    <button
                        onClick={fetchServices}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 hover:text-blue-600 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all font-medium"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        <span>Refresh List</span>
                    </button>
                </div>

                {/* Status Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div
                        onClick={() => setFilterStatus('all')}
                        className={`bg-white rounded-2xl p-5 shadow-sm border cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 ${filterStatus === 'all' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-100'}`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <Briefcase size={20} />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{services.length}</span>
                        </div>
                        <div className="text-xs text-gray-500 font-medium">Total Gigs</div>
                    </div>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                            <div
                                key={key}
                                onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
                                className={`bg-white rounded-2xl p-5 shadow-sm border cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 ${filterStatus === key ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-100'}`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className={`p-2 rounded-xl ${config.bg} ${config.text}`}>
                                        <Icon size={20} />
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900">{statusCounts[key] || 0}</span>
                                </div>
                                <div className="text-xs text-gray-500 font-medium">{config.label}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-2 mb-8 sticky top-24 z-30">
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by title, provider, or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-0 focus:bg-gray-100 transition-all text-gray-900 placeholder-gray-400"
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="pl-12 pr-8 py-3 bg-gray-50 border-none rounded-2xl focus:ring-0 focus:bg-gray-100 transition-all text-gray-900 appearance-none cursor-pointer min-w-[160px]"
                                >
                                    <option value="all">All Status</option>
                                    <option value="INREVIEW">In Review</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="ADVICED">Adviced</option>
                                </select>
                            </div>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="pl-12 pr-8 py-3 bg-gray-50 border-none rounded-2xl focus:ring-0 focus:bg-gray-100 transition-all text-gray-900 appearance-none cursor-pointer min-w-[170px]"
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
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading services...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-3xl text-center border border-red-100">
                        <p className="font-medium">{error}</p>
                        <button onClick={fetchServices} className="mt-4 text-sm underline hover:text-red-700">Try Again</button>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-left">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Service</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Provider / Category</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status & Price</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredServices.map((service) => {
                                        const CategoryIcon = CATEGORY_ICONS[service.category] || HelpCircle;
                                        return (
                                            <motion.tr
                                                key={service.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="group hover:bg-gray-50/50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-shrink-0 h-16 w-16 relative">
                                                            {service.imageUrls && service.imageUrls.length > 0 ? (
                                                                <img
                                                                    src={service.imageUrls[0]}
                                                                    alt={service.title}
                                                                    className="h-16 w-16 rounded-2xl object-cover shadow-sm ring-1 ring-gray-100"
                                                                />
                                                            ) : (
                                                                <div className="h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 ring-1 ring-gray-100">
                                                                    <Briefcase size={24} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div
                                                                className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer text-lg leading-tight mb-1"
                                                                onClick={() => navigate(`/gig/${service.id}`)}
                                                            >
                                                                {service.title}
                                                            </div>
                                                            <div className="text-xs text-gray-400 flex items-center gap-1">
                                                                <Calendar size={12} />
                                                                {new Date(service.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="font-medium text-gray-900 flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                                                {service.providerName?.charAt(0)}
                                                            </div>
                                                            {service.providerName}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600 flex items-center gap-1.5 border border-gray-200">
                                                                <CategoryIcon size={12} />
                                                                {CATEGORY_NAMES[service.category] || service.category}
                                                            </span>
                                                        </div>
                                                        {(service.origin || service.destination) && (
                                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                                <MapPin size={12} />
                                                                {service.origin} {service.destination && `→ ${service.destination}`}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-2 items-start">
                                                        {getStatusBadge(service.status)}
                                                        <div className="text-sm font-bold text-gray-900 pl-1">
                                                            {service.currency} {service.price} <span className="text-xs font-normal text-gray-500 lowercase">/ {service.pricingType}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => navigate(`/gig/${service.id}`)}
                                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                            title="View Details"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        {service.status !== 'APPROVED' && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(service.id, 'APPROVED')}
                                                                disabled={updatingId === service.id}
                                                                className={`p-2 hover:bg-emerald-50 rounded-xl transition-all ${updatingId === service.id ? 'opacity-50 cursor-not-allowed text-emerald-400' : 'text-emerald-500 hover:text-emerald-700'}`}
                                                                title="Approve"
                                                            >
                                                                {updatingId === service.id ? (
                                                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                                ) : (
                                                                    <CheckCircle size={18} />
                                                                )}
                                                            </button>
                                                        )}
                                                        {service.status !== 'ADVICED' && (
                                                            <button
                                                                onClick={() => openAdviceModal(service)}
                                                                className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                                title="Send Advice"
                                                            >
                                                                <HelpCircle size={18} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => openDeleteModal(service)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                            title="Delete Listing"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                    {filteredServices.length === 0 && (
                                        <tr>
                                            <td colspan="4" className="px-6 py-12 text-center text-gray-400">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-4 bg-gray-50 rounded-full">
                                                        <Briefcase size={24} />
                                                    </div>
                                                    <p>No services found matching your filters.</p>
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

            {/* Delete Reason Modal */}
            <AnimatePresence>
                {deleteModal.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-md z-[300] flex items-center justify-center p-4"
                        onClick={() => !deleteModal.loading && setDeleteModal({ show: false, serviceId: null, serviceTitle: '', reason: '', customReason: '', loading: false })}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-100"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                                    <Trash2 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Delete Service</h3>
                                    <p className="text-sm text-gray-500 line-clamp-1">{deleteModal.serviceTitle}</p>
                                </div>
                            </div>

                            <p className="text-gray-600 mb-6 bg-gray-50 p-4 rounded-xl text-sm">
                                This action is permanent. The provider will be notified.
                            </p>

                            <div className="space-y-3 mb-6">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Reason for deletion</label>
                                {DELETE_REASONS.map((reason) => (
                                    <label
                                        key={reason}
                                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${deleteModal.reason === reason
                                            ? 'border-red-500 bg-red-50 text-red-900'
                                            : 'border-gray-100 hover:bg-gray-50 hover:border-gray-200'
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
                                        <span className="text-sm font-medium">{reason}</span>
                                    </label>
                                ))}
                            </div>

                            {deleteModal.reason === 'Other' && (
                                <div className="mb-6">
                                    <textarea
                                        value={deleteModal.customReason}
                                        onChange={(e) => setDeleteModal(prev => ({ ...prev, customReason: e.target.value }))}
                                        placeholder="Enter the specific reason..."
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm text-gray-900 placeholder-gray-400 resize-none bg-gray-50"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteModal({ show: false, serviceId: null, serviceTitle: '', reason: '', customReason: '', loading: false })}
                                    disabled={deleteModal.loading}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-bold text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteService}
                                    disabled={deleteModal.loading || !deleteModal.reason || (deleteModal.reason === 'Other' && !deleteModal.customReason.trim())}
                                    className={`flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-200 ${deleteModal.loading || !deleteModal.reason || (deleteModal.reason === 'Other' && !deleteModal.customReason.trim())
                                        ? 'opacity-50 cursor-not-allowed shadow-none'
                                        : 'hover:-translate-y-0.5'
                                        }`}
                                >
                                    {deleteModal.loading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Trash2 size={18} />
                                    )}
                                    Confirm Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Advice Reason Modal */}
            <AnimatePresence>
                {adviceModal.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-md z-[300] flex items-center justify-center p-4"
                        onClick={() => !adviceModal.loading && setAdviceModal({ show: false, serviceId: null, serviceTitle: '', reason: '', customReason: '', loading: false })}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-100"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                                    <HelpCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Send Advice</h3>
                                    <p className="text-sm text-gray-500 line-clamp-1">{adviceModal.serviceTitle}</p>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle size={16} className="text-amber-600" />
                                    <p className="text-xs font-bold text-amber-800 uppercase">Provider Notification</p>
                                </div>
                                <p className="text-xs text-amber-700 leading-relaxed">
                                    The provider will be notified to update their listing. Continued non-compliance may lead to removal.
                                </p>
                            </div>

                            <div className="space-y-3 mb-6">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Select an issue</label>
                                {ADVICE_REASONS.map((reason) => (
                                    <label
                                        key={reason}
                                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${adviceModal.reason === reason
                                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                                            : 'border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="adviceReason"
                                            value={reason}
                                            checked={adviceModal.reason === reason}
                                            onChange={(e) => setAdviceModal(prev => ({ ...prev, reason: e.target.value, customReason: '' }))}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium">{reason}</span>
                                    </label>
                                ))}
                            </div>

                            {adviceModal.reason === 'Other' && (
                                <div className="mb-6">
                                    <textarea
                                        value={adviceModal.customReason}
                                        onChange={(e) => setAdviceModal(prev => ({ ...prev, customReason: e.target.value }))}
                                        placeholder="Describe the issue..."
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-gray-900 placeholder-gray-400 resize-none bg-gray-50"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setAdviceModal({ show: false, serviceId: null, serviceTitle: '', reason: '', customReason: '', loading: false })}
                                    disabled={adviceModal.loading}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-bold text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdviceService}
                                    disabled={adviceModal.loading || !adviceModal.reason || (adviceModal.reason === 'Other' && !adviceModal.customReason.trim())}
                                    className={`flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 ${adviceModal.loading || !adviceModal.reason || (adviceModal.reason === 'Other' && !adviceModal.customReason.trim())
                                        ? 'opacity-50 cursor-not-allowed shadow-none'
                                        : 'hover:-translate-y-0.5'
                                        }`}
                                >
                                    {adviceModal.loading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Briefcase size={18} />
                                    )}
                                    Send Advice
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
