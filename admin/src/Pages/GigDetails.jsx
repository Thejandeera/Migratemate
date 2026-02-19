import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthData } from '../utils/auth';
import {
    MapPin,
    Calendar,
    Clock,
    DollarSign,
    User,
    Tag,
    ArrowLeft,
    Star,
    CheckCircle,
    XCircle,
    Copy,
    ExternalLink,
    AlertTriangle,
    HelpCircle,
    Trash2,
    Shield,
    Briefcase
} from 'lucide-react';

// Enhanced ZoomableImage with better responsive behavior (Matching ViewUsers.jsx)
const ZoomableImage = ({ src, alt, className }) => {
    const [isHovered, setIsHovered] = useState(false);

    if (!src) return (
        <div className={`bg-gray-100 flex items-center justify-center text-gray-400 text-xs ${className}`}>
            <Briefcase size={24} />
        </div>
    );

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setTimeout(() => setIsHovered(false), 2000)}
        >
            <img
                src={src}
                alt={alt}
                className={`${className} object-cover cursor-pointer transition-all duration-300 ${isHovered ? 'scale-105 filter brightness-110' : 'scale-100'}`}
            />
            {isHovered && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="fixed z-[9999] pointer-events-none"
                    style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 'auto',
                        maxWidth: 'min(90vw, 600px)',
                        maxHeight: 'min(90vh, 600px)',
                    }}
                >
                    <img
                        src={src}
                        alt={alt}
                        className="w-auto h-auto max-w-full max-h-full object-contain rounded-2xl shadow-2xl bg-white p-2 border border-gray-100"
                    />
                </motion.div>
            )}
        </div>
    );
};

const STATUS_CONFIG = {
    INREVIEW: { label: 'In Review', bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', icon: AlertTriangle },
    APPROVED: { label: 'Approved', bg: 'bg-[#1a3a1d]/10', text: 'text-[#1a3a1d]', dot: 'bg-[#1a3a1d]', icon: CheckCircle },
    ADVICED: { label: 'Adviced', bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', icon: HelpCircle },
};

const GigDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ show: false, reason: '', customReason: '', loading: false });
    const [adviceModal, setAdviceModal] = useState({ show: false, reason: '', customReason: '', loading: false });

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

    useEffect(() => {
        fetchServiceDetails();
    }, [id]);

    const getHeaders = () => {
        const auth = getAuthData();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.token}`
        };
    };

    const fetchServiceDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/services/${id}`, {
                headers: getHeaders()
            });
            const data = await response.json();

            if (data.success) {
                setService(data.data);
            } else {
                setError(data.message || 'Failed to fetch service details');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred while fetching service details');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text).then(() => {
            showNotification(`${label} copied to clipboard`, 'success');
        });
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const handleStatusUpdate = async (newStatus) => {
        setUpdatingStatus(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/services/admin/${id}/status`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ status: newStatus })
            });
            const data = await response.json();
            if (data.success) {
                setService({ ...service, status: newStatus });
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

    const handleAdviceService = async () => {
        const reason = adviceModal.reason === 'Other' ? adviceModal.customReason : adviceModal.reason;
        if (!reason.trim()) {
            showNotification('Please select or enter a reason', 'error');
            return;
        }
        setAdviceModal(prev => ({ ...prev, loading: true }));
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/services/admin/${id}/status`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ status: 'ADVICED', reason })
            });
            const data = await response.json();
            if (data.success) {
                setService({ ...service, status: 'ADVICED' });
                showNotification('Advice sent and provider notified via email', 'success');
                setAdviceModal({ show: false, reason: '', customReason: '', loading: false });
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/services/admin/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
                body: JSON.stringify({ reason })
            });
            const data = await response.json();
            if (data.success) {
                showNotification('Service deleted and provider notified via email', 'success');
                setTimeout(() => navigate('/gigs'), 1500);
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

    const getStatusBadge = (isActive, isAvailable) => {
        if (!isActive) return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold flex items-center gap-1"><XCircle className="w-3 h-3" /> Inactive</span>;
        if (isAvailable) return <span className="px-3 py-1 bg-[#1a3a1d]/10 text-[#1a3a1d] rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Available</span>;
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> Unavailable</span>;
    };

    const getServiceStatusBadge = (status) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.INREVIEW;
        const Icon = config.icon;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${config.bg} ${config.text}`}>
                <Icon size={12} strokeWidth={3} />
                {config.label}
            </span>
        );
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col font-sans">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        </div>
    );

    if (error || !service) return (
        <div className="min-h-screen flex flex-col font-sans">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-gray-100">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Gig</h2>
                    <p className="text-gray-600 mb-6">{error || "Service not found"}</p>
                    <button
                        onClick={() => navigate('/gigs')}
                        className="px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-bold"
                    >
                        Back to Gigs
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen font-sans text-gray-900 pb-12">
            <Navbar />

            {/* Notification */}
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className={`fixed top-24 right-4 z-[200] max-w-sm w-full p-4 rounded-2xl shadow-2xl backdrop-blur-md border border-white/20 ${notification.type === 'success'
                            ? 'bg-[#1a3a1d]/50/90 text-white'
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/gigs')}
                        className="flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6 group font-medium"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Gigs
                    </button>

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{service.title}</h1>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                {getStatusBadge(service.isActive, service.isAvailable)}
                                {getServiceStatusBadge(service.status)}
                                <div className="h-4 w-px bg-gray-300 mx-1 hidden sm:block"></div>
                                <div className="flex items-center gap-4 text-gray-500 text-sm font-medium">
                                    <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-blue-300 transition-colors" onClick={() => copyToClipboard(service.id, 'Service ID')}>
                                        <span className="font-mono text-xs">ID: {service.id}</span>
                                        <Copy className="w-3 h-3 hover:text-blue-500" />
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        Created: {new Date(service.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white px-5 py-3 rounded-2xl shadow-lg shadow-gray-100 border border-gray-100 flex flex-col items-end">
                                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Price</span>
                                <div className="text-3xl font-extrabold text-[#1a3a1d] flex items-baseline">
                                    {service.currency} {service.price}
                                    <span className="text-sm text-gray-400 font-medium ml-1">/{service.pricingType?.toLowerCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden p-6 md:p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="p-2.5 bg-purple-100 rounded-xl text-purple-600">
                                    <ExternalLink className="w-5 h-5" />
                                </div>
                                Gallery
                            </h2>
                            {service.imageUrls && service.imageUrls.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                                    {service.imageUrls.map((url, index) => (
                                        <div key={index} className="aspect-video rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
                                            <ZoomableImage
                                                src={url}
                                                alt={`Service Image ${index + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-48 bg-gray-50 rounded-2xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
                                    <Briefcase size={32} className="mb-2 opacity-50" />
                                    <span className="font-medium">No images available</span>
                                </div>
                            )}
                        </div>

                        {/* Description & Features */}
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 p-6 md:p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600">
                                    <Tag className="w-5 h-5" />
                                </div>
                                About This Gig
                            </h2>
                            <div className="prose prose-blue max-w-none text-gray-600 mb-8 leading-relaxed">
                                <p className="whitespace-pre-line">{service.description}</p>
                            </div>

                            {service.features && service.features.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Features</h3>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {service.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-3 text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                                                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                <span className="font-medium">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Location Details */}
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 p-6 md:p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="p-2.5 bg-teal-100 rounded-xl text-teal-600">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                Location & Availability
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-5">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 p-1.5 bg-gray-100 rounded-lg text-gray-500"><MapPin className="w-4 h-4" /></div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Origin</p>
                                            <p className="font-bold text-gray-900 text-lg">{service.origin || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 p-1.5 bg-gray-100 rounded-lg text-gray-500"><MapPin className="w-4 h-4" /></div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Destination</p>
                                            <p className="font-bold text-gray-900 text-lg">{service.destination || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 p-1.5 bg-gray-100 rounded-lg text-gray-500"><MapPin className="w-4 h-4" /></div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Specific Location</p>
                                            <p className="font-medium text-gray-900">{service.specificLocation || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-5">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 p-1.5 bg-gray-100 rounded-lg text-gray-500"><Calendar className="w-4 h-4" /></div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Available Days</p>
                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                {service.availableDays && service.availableDays.length > 0 ? (
                                                    service.availableDays.map(day => (
                                                        <span key={day} className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-100">
                                                            {day}
                                                        </span>
                                                    ))
                                                ) : <span className="text-gray-500 font-medium">Not specified</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 p-1.5 bg-gray-100 rounded-lg text-gray-500"><Clock className="w-4 h-4" /></div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Time Slot</p>
                                            <p className="font-medium text-gray-900">{service.availableTimeSlot || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 p-1.5 bg-gray-100 rounded-lg text-gray-500"><Clock className="w-4 h-4" /></div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Duration</p>
                                            <p className="font-medium text-gray-900">{service.duration ? `${service.duration} ${service.durationType}` : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Provider Card */}
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-400" />
                                Provider Details
                            </h2>
                            <div className="flex items-center gap-4 mb-6">
                                <Link to={`/users/${service.providerId}`} className="flex-shrink-0 relative group">
                                    <img
                                        src={service.providerProfilePicture || `https://ui-avatars.com/api/?name=${service.providerName}`}
                                        alt={service.providerName}
                                        className="w-16 h-16 rounded-full border-4 border-gray-50 group-hover:border-blue-100 transition-colors shadow-sm"
                                    />
                                    {service.providerIsVerified && (
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                            <Shield className="w-5 h-5 text-blue-500 fill-blue-500" />
                                        </div>
                                    )}
                                </Link>
                                <div>
                                    <Link to={`/users/${service.providerId}`} className="font-bold text-gray-900 text-lg hover:text-blue-600 transition-colors">
                                        {service.providerName}
                                    </Link>
                                    <div className="text-sm font-medium text-gray-500">Service Provider</div>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(`/users/${service.providerId}`)}
                                className="w-full py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-bold text-sm flex items-center justify-center gap-2 border border-gray-200"
                            >
                                <User className="w-4 h-4" />
                                View Full Profile
                            </button>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-gray-400" />
                                Statistics
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-2xl text-center border border-gray-100">
                                    <div className="text-2xl font-black text-gray-900">{service.totalBookings || 0}</div>
                                    <div className="text-[10px] text-gray-500 uppercase font-bold mt-1 tracking-wide">Total Bookings</div>
                                </div>
                                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-2xl text-center border border-yellow-100">
                                    <div className="text-2xl font-black text-yellow-600 flex items-center justify-center gap-1">
                                        {service.averageRating ? service.averageRating.toFixed(1) : 'N/A'}
                                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                    </div>
                                    <div className="text-[10px] text-yellow-700/70 uppercase font-bold mt-1 tracking-wide">{service.totalReviews || 0} Reviews</div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Status Actions */}
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-gray-400" />
                                Admin Actions
                            </h2>

                            <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Status</span>
                                    {getServiceStatusBadge(service.status)}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {service.status !== 'APPROVED' && (
                                    <button
                                        onClick={() => handleStatusUpdate('APPROVED')}
                                        disabled={updatingStatus}
                                        className={`w-full py-3 bg-[#1a3a1d]/5 text-[#1a3a1d] rounded-xl hover:bg-[#1a3a1d]/10 transition-colors font-bold text-sm flex items-center justify-center gap-2 border border-[#1a3a1d]/15 ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Approve Service
                                    </button>
                                )}

                                {service.status !== 'ADVICED' && (
                                    <button
                                        onClick={() => setAdviceModal({ show: true, reason: '', customReason: '', loading: false })}
                                        disabled={updatingStatus}
                                        className={`w-full py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-bold text-sm flex items-center justify-center gap-2 border border-blue-200 ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                        Send Advice
                                    </button>
                                )}

                                {service.status !== 'INREVIEW' && (
                                    <button
                                        onClick={() => handleStatusUpdate('INREVIEW')}
                                        disabled={updatingStatus}
                                        className={`w-full py-3 bg-yellow-50 text-yellow-700 rounded-xl hover:bg-yellow-100 transition-colors font-bold text-sm flex items-center justify-center gap-2 border border-yellow-200 ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <AlertTriangle className="w-4 h-4" />
                                        Set In Review
                                    </button>
                                )}

                                <button
                                    onClick={() => setDeleteModal({ show: true, reason: '', customReason: '', loading: false })}
                                    disabled={updatingStatus}
                                    className={`w-full py-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors font-bold text-sm flex items-center justify-center gap-2 border border-red-200 ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Listing
                                </button>
                            </div>
                        </div>

                        {/* Additional Details Card */}
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 p-6 mt-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">
                                Gig Details
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm font-medium">Category</span>
                                    <span className="font-bold text-gray-900">{service.category}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm font-medium">Max Capacity</span>
                                    <span className="font-bold text-gray-900">{service.maxCapacity} People</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm font-medium">Pricing Type</span>
                                    <span className="font-bold text-gray-900 capitalize">{service.pricingType?.toLowerCase()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm font-medium">Last Updated</span>
                                    <span className="font-bold text-gray-900">{new Date(service.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Delete Reason Modal */}
            <AnimatePresence>
                {deleteModal.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-md z-[300] flex items-center justify-center p-4"
                        onClick={() => !deleteModal.loading && setDeleteModal({ show: false, reason: '', customReason: '', loading: false })}
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
                                    <p className="text-sm text-gray-500 line-clamp-1">{service?.title}</p>
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
                                            name="deleteReasonGigDetails"
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
                                    onClick={() => setDeleteModal({ show: false, reason: '', customReason: '', loading: false })}
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
                        onClick={() => !adviceModal.loading && setAdviceModal({ show: false, reason: '', customReason: '', loading: false })}
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
                                    <p className="text-sm text-gray-500 line-clamp-1">{service?.title}</p>
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
                                            name="adviceReasonGigDetails"
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
                                    onClick={() => setAdviceModal({ show: false, reason: '', customReason: '', loading: false })}
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
                                    <Briefcase size={18} />
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

export default GigDetails;
