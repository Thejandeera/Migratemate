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
    Edit2,
    Trash2,
    CheckCircle,
    XCircle,
    AlertTriangle,
    HelpCircle,
    MoreVertical,
    Truck,
    Home,
    FileText,
    Globe,
    DollarSign,
    Heart,
    BookOpen,
    Scale,
    Briefcase,
    LayoutGrid,
    List
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

const ManageGigs = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const [deleteModal, setDeleteModal] = useState({ show: false, serviceId: null, serviceTitle: '', reason: '', customReason: '', loading: false });
    const [adviceModal, setAdviceModal] = useState({ show: false, serviceId: null, serviceTitle: '', reason: '', customReason: '', loading: false });

    // Predefined reasons for deletion/advice
    const DELETE_REASONS = [
        'Violation of rules',
        'Inappropriate content',
        'Duplicate listing',
        'Fraudulent info',
        'Other'
    ];

    const ADVICE_REASONS = [
        'Unclear description',
        'Pricing update needed',
        'Low quality images',
        'Incorrect category',
        'Other'
    ];

    const navigate = useNavigate();

    const getHeaders = () => {
        const auth = getAuthData();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.token}`
        };
    };

    const fetchGigs = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/services/all`, {
                headers: getHeaders()
            });
            const data = await response.json();
            if (data.success) {
                setServices(data.data);
            } else {
                setError(data.message || "Failed to fetch services");
            }
        } catch (err) {
            setError('Failed to fetch services. Ensure the server is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGigs();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/services/admin/${id}/status`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ status: newStatus })
            });
            const data = await response.json();
            if (data.success) {
                setServices(services.map(s => s.id === id ? { ...s, status: newStatus } : s));
                showNotification(`Service ${newStatus.toLowerCase()} successfully`, 'success');
            } else {
                showNotification(data.message || 'Update failed', 'error');
            }
        } catch (err) {
            console.error(err);
            showNotification('Failed to update status', 'error');
        }
    };

    const handleDeleteService = async () => {
        const { serviceId, reason, customReason } = deleteModal;
        const finalReason = reason === 'Other' ? customReason : reason;

        if (!finalReason) {
            showNotification('Please provide a reason', 'error');
            return;
        }

        setDeleteModal(prev => ({ ...prev, loading: true }));
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/services/admin/${serviceId}`, {
                method: 'DELETE',
                headers: getHeaders(),
                body: JSON.stringify({ reason: finalReason })
            });

            const data = await response.json();
            if (data.success) {
                setServices(services.filter(s => s.id !== serviceId));
                showNotification('Service deleted successfully', 'success');
                setDeleteModal({ show: false, serviceId: null, serviceTitle: '', reason: '', customReason: '', loading: false });
            } else {
                showNotification(data.message || 'Delete failed', 'error');
                setDeleteModal(prev => ({ ...prev, loading: false }));
            }
        } catch (err) {
            console.error(err);
            showNotification('Failed to delete service', 'error');
            setDeleteModal(prev => ({ ...prev, loading: false }));
        }
    };

    const handleAdviceService = async () => {
        const { serviceId, reason, customReason } = adviceModal;
        const finalReason = reason === 'Other' ? customReason : reason;

        if (!finalReason) {
            showNotification('Please provide a reason', 'error');
            return;
        }

        setAdviceModal(prev => ({ ...prev, loading: true }));
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/services/admin/${serviceId}/status`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ status: 'ADVICED', reason: finalReason })
            });

            const data = await response.json();
            if (data.success) {
                setServices(services.map(s => s.id === serviceId ? { ...s, status: 'ADVICED' } : s));
                showNotification('Advice sent successfully', 'success');
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

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const filteredServices = services.filter(service => {
        const matchesSearch = searchTerm === '' ||
            service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.providerName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || service.status === statusFilter;
        const matchesCategory = categoryFilter === 'ALL' || service.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    const categories = ['ALL', ...new Set(services.map(s => s.category))].filter(Boolean);

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
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gig Management</h1>
                        <p className="text-gray-500">Review, approve, and manage service listings.</p>
                    </div>
                    <button
                        onClick={fetchGigs}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 hover:text-blue-600 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all font-medium"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        <span>Refresh List</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-2 mb-8 sticky top-24 z-30">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col md:flex-row gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search gigs or providers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-0 focus:bg-gray-100 transition-all text-gray-900 placeholder-gray-400"
                                />
                            </div>
                            <div className="flex bg-gray-100 rounded-2xl p-1">
                                {['ALL', 'INREVIEW', 'APPROVED', 'ADVICED'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${statusFilter === status
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {status === 'ALL' ? 'All' : STATUS_CONFIG[status]?.label || status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category Pills */}
                        <div className="overflow-x-auto pb-1 hide-scrollbar">
                            <div className="flex gap-2">
                                {categories.map((cat) => {
                                    const Icon = CATEGORY_ICONS[cat] || HelpCircle;
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setCategoryFilter(cat)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${categoryFilter === cat
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                    : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                                                }`}
                                        >
                                            {cat !== 'ALL' && <Icon size={12} />}
                                            {cat}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading gigs...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-3xl text-center border border-red-100">
                        <p className="font-medium">{error}</p>
                        <button onClick={fetchGigs} className="mt-4 text-sm underline hover:text-red-700">Try Again</button>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-left">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Service</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category & Price</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Provider</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredServices.map((service) => {
                                        const StatusIcon = STATUS_CONFIG[service.status]?.icon || AlertTriangle;
                                        return (
                                            <motion.tr
                                                key={service.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="group hover:bg-gray-50/50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                                                            {service.imageUrls?.[0] ? (
                                                                <img src={service.imageUrls[0]} alt={service.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                    <Briefcase size={20} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-sm line-clamp-1 w-48" title={service.title}>
                                                                {service.title}
                                                            </div>
                                                            <div className="text-xs text-gray-400 mt-0.5">ID: {service.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                                            {React.createElement(CATEGORY_ICONS[service.category] || HelpCircle, { size: 10 })}
                                                            {service.category}
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {service.currency} {service.price} <span className="text-gray-400 text-xs">/ {service.pricingType?.toLowerCase()}</span>
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                                                            <img
                                                                src={service.providerProfilePicture || `https://ui-avatars.com/api/?name=${service.providerName}`}
                                                                alt={service.providerName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <span className="text-sm text-gray-700">{service.providerName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit ${STATUS_CONFIG[service.status]?.bg || 'bg-gray-100'} ${STATUS_CONFIG[service.status]?.text || 'text-gray-800'}`}>
                                                        <StatusIcon size={12} />
                                                        {STATUS_CONFIG[service.status]?.label || service.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => navigate(`/gigs/${service.id}`)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                            title="View Details"
                                                        >
                                                            <Eye size={18} />
                                                        </button>

                                                        {service.status === 'INREVIEW' && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(service.id, 'APPROVED')}
                                                                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>
                                                        )}

                                                        <div className="relative group/more">
                                                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                                                                <MoreVertical size={18} />
                                                            </button>
                                                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 hidden group-hover/more:block">
                                                                <button
                                                                    onClick={() => {
                                                                        setAdviceModal({
                                                                            show: true,
                                                                            serviceId: service.id,
                                                                            serviceTitle: service.title,
                                                                            reason: '',
                                                                            customReason: '',
                                                                            loading: false
                                                                        });
                                                                    }}
                                                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                >
                                                                    <HelpCircle size={14} /> Send Advice
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setDeleteModal({
                                                                            show: true,
                                                                            serviceId: service.id,
                                                                            serviceTitle: service.title,
                                                                            reason: '',
                                                                            customReason: '',
                                                                            loading: false
                                                                        });
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
                                        );
                                    })}
                                    {filteredServices.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-4 bg-gray-50 rounded-full">
                                                        <Search size={24} />
                                                    </div>
                                                    <p>No gigs found matching your criteria.</p>
                                                    <button onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); setCategoryFilter('ALL'); }} className="text-blue-600 hover:underline text-sm font-medium">Clear all filters</button>
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

            {/* Modals for Delete and Advice (Reused from GigDetails logic but adapted for list) */}
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
                                        placeholder="Enter specific reason..."
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm bg-gray-50"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteModal({ show: false, serviceId: null, serviceTitle: '', reason: '', customReason: '', loading: false })}
                                    disabled={deleteModal.loading}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-bold text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteService}
                                    disabled={deleteModal.loading || !deleteModal.reason}
                                    className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold text-sm shadow-xl shadow-red-200"
                                >
                                    {deleteModal.loading ? 'Deleting...' : 'Confirm Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setAdviceModal({ show: false, serviceId: null, serviceTitle: '', reason: '', customReason: '', loading: false })}
                                    disabled={adviceModal.loading}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-bold text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdviceService}
                                    disabled={adviceModal.loading || !adviceModal.reason}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-sm shadow-xl shadow-blue-200"
                                >
                                    {adviceModal.loading ? 'Sending...' : 'Send Advice'}
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
