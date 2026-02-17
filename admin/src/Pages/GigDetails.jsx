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
    ExternalLink
} from 'lucide-react';

// Reusing ZoomableImage component
const ZoomableImage = ({ src, alt, className }) => {
    const [isHovered, setIsHovered] = useState(false);

    if (!src) return (
        <div className={`bg-gray-100 flex items-center justify-center text-gray-400 text-xs ${className}`}>
            No Image
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
                className={`${className} object-cover cursor-pointer transition-all duration-300 ${isHovered ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}
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
                        className="w-auto h-auto max-w-full max-h-full object-contain rounded-xl shadow-2xl bg-white border-4 border-white"
                    />
                </motion.div>
            )}
        </div>
    );
};

const STATUS_CONFIG = {
    INREVIEW: { label: 'In Review', bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
    APPROVED: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    ADVICED: { label: 'Adviced', bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
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
        if (!isActive) return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center gap-1"><XCircle className="w-3 h-3" /> Inactive</span>;
        if (isAvailable) return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Available</span>;
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center gap-1"><Clock className="w-3 h-3" /> Unavailable</span>;
    };

    const getServiceStatusBadge = (status) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.INREVIEW;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${config.bg} ${config.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
                {config.label}
            </span>
        );
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        </div>
    );

    if (error || !service) return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Gig</h2>
                    <p className="text-gray-600 mb-6">{error || "Service not found"}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-500 hover:text-gray-800 transition-colors mb-4 group"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{service.title}</h1>
                                {getStatusBadge(service.isActive, service.isAvailable)}
                                {getServiceStatusBadge(service.status)}
                            </div>
                            <div className="flex items-center gap-4 text-gray-500 text-sm">
                                <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200" onClick={() => copyToClipboard(service.id, 'Service ID')}>
                                    <span className="font-mono">ID: {service.id}</span>
                                    <Copy className="w-3 h-3 cursor-pointer hover:text-blue-500" />
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Created: {new Date(service.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex flex-col items-end">
                                <span className="text-xs text-gray-500 uppercase font-semibold">Price</span>
                                <div className="text-2xl font-bold text-green-600 flex items-baseline">
                                    {service.currency} {service.price}
                                    <span className="text-sm text-gray-400 font-normal ml-1">/{service.pricingType?.toLowerCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                    <ExternalLink className="w-5 h-5" />
                                </div>
                                Gallery
                            </h2>
                            {service.imageUrls && service.imageUrls.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {service.imageUrls.map((url, index) => (
                                        <div key={index} className="aspect-video rounded-xl overflow-hidden border border-gray-100">
                                            <ZoomableImage
                                                src={url}
                                                alt={`Service Image ${index + 1}`}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-40 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-dashed border-gray-300">
                                    No images available
                                </div>
                            )}
                        </div>

                        {/* Description & Features */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <Tag className="w-5 h-5" />
                                </div>
                                About This Gig
                            </h2>
                            <div className="prose max-w-none text-gray-600 mb-6">
                                <p className="whitespace-pre-line">{service.description}</p>
                            </div>

                            {service.features && service.features.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {service.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-2 text-gray-600 bg-gray-50 p-3 rounded-lg">
                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Location Details */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                Location & Availability
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1"><MapPin className="w-5 h-5 text-gray-400" /></div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Origin</p>
                                            <p className="font-medium text-gray-900">{service.origin || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1"><MapPin className="w-5 h-5 text-gray-400" /></div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Destination</p>
                                            <p className="font-medium text-gray-900">{service.destination || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1"><MapPin className="w-5 h-5 text-gray-400" /></div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Specific Location</p>
                                            <p className="font-medium text-gray-900">{service.specificLocation || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1"><Calendar className="w-5 h-5 text-gray-400" /></div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Available Days</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {service.availableDays && service.availableDays.length > 0 ? (
                                                    service.availableDays.map(day => (
                                                        <span key={day} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100">
                                                            {day}
                                                        </span>
                                                    ))
                                                ) : <span className="text-gray-500">Not specified</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1"><Clock className="w-5 h-5 text-gray-400" /></div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Time Slot</p>
                                            <p className="font-medium text-gray-900">{service.availableTimeSlot || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1"><Clock className="w-5 h-5 text-gray-400" /></div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Duration</p>
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
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-500" />
                                Provider Details
                            </h2>
                            <div className="flex items-center gap-4 mb-6">
                                <Link to={`/users/${service.providerId}`} className="flex-shrink-0">
                                    <img
                                        src={service.providerProfilePicture || `https://ui-avatars.com/api/?name=${service.providerName}`}
                                        alt={service.providerName}
                                        className="w-16 h-16 rounded-full border-4 border-gray-50 hover:border-blue-100 transition-colors"
                                    />
                                </Link>
                                <div>
                                    <Link to={`/users/${service.providerId}`} className="font-bold text-gray-900 text-lg hover:text-blue-600 transition-colors">
                                        {service.providerName}
                                    </Link>
                                    <div className="text-sm text-gray-500">Service Provider</div>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(`/users/${service.providerId}`)}
                                className="w-full py-2.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm flex items-center justify-center gap-2 border border-gray-200"
                            >
                                <User className="w-4 h-4" />
                                View Full Profile
                            </button>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-gray-500" />
                                Statistics
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-gray-900">{service.totalBookings || 0}</div>
                                    <div className="text-xs text-gray-500 uppercase mt-1">Total Bookings</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-yellow-500 flex items-center justify-center gap-1">
                                        {service.averageRating ? service.averageRating.toFixed(1) : 'N/A'}
                                        <Star className="w-4 h-4 fill-yellow-500" />
                                    </div>
                                    <div className="text-xs text-gray-500 uppercase mt-1">{service.totalReviews || 0} Reviews</div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Status Actions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Tag className="w-5 h-5 text-gray-500" />
                                Service Status
                            </h2>
                            <div className="mb-4">
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-gray-500 text-sm">Current Status</span>
                                    {getServiceStatusBadge(service.status)}
                                </div>
                            </div>
                            <div className="space-y-2">
                                {service.status !== 'APPROVED' && (
                                    <button
                                        onClick={() => handleStatusUpdate('APPROVED')}
                                        disabled={updatingStatus}
                                        className={`w-full py-2.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm flex items-center justify-center gap-2 border border-green-200 ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Approve
                                    </button>
                                )}
                                <button
                                    onClick={() => setDeleteModal({ show: true, reason: '', customReason: '', loading: false })}
                                    disabled={updatingStatus}
                                    className={`w-full py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm flex items-center justify-center gap-2 border border-red-200 ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <XCircle className="w-4 h-4" />
                                    Delete Service
                                </button>
                                {service.status !== 'ADVICED' && (
                                    <button
                                        onClick={() => setAdviceModal({ show: true, reason: '', customReason: '', loading: false })}
                                        disabled={updatingStatus}
                                        className={`w-full py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm flex items-center justify-center gap-2 border border-blue-200 ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <Clock className="w-4 h-4" />
                                        Advice
                                    </button>
                                )}
                                {service.status !== 'INREVIEW' && (
                                    <button
                                        onClick={() => handleStatusUpdate('INREVIEW')}
                                        disabled={updatingStatus}
                                        className={`w-full py-2.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors font-medium text-sm flex items-center justify-center gap-2 border border-yellow-200 ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <Clock className="w-4 h-4" />
                                        Set In Review
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Details Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">
                                Additional Info
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm">Category</span>
                                    <span className="font-medium text-gray-900">{service.category}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm">Max Capacity</span>
                                    <span className="font-medium text-gray-900">{service.maxCapacity} People</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm">Pricing Type</span>
                                    <span className="font-medium text-gray-900 capitalize">{service.pricingType?.toLowerCase()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm">Last Updated</span>
                                    <span className="font-medium text-gray-900">{new Date(service.updatedAt).toLocaleDateString()}</span>
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
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
                        onClick={() => !deleteModal.loading && setDeleteModal({ show: false, reason: '', customReason: '', loading: false })}
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
                                    <p className="text-sm text-gray-500 line-clamp-1">{service?.title}</p>
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
                                            name="deleteReasonGig"
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
                                    onClick={() => setDeleteModal({ show: false, reason: '', customReason: '', loading: false })}
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

            {/* Advice Reason Modal */}
            <AnimatePresence>
                {adviceModal.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
                        onClick={() => !adviceModal.loading && setAdviceModal({ show: false, reason: '', customReason: '', loading: false })}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Send Advice</h3>
                                    <p className="text-sm text-gray-500 line-clamp-1">{service?.title}</p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-2">
                                This will notify the provider to review and update their listing accordingly.
                            </p>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                                <p className="text-xs text-amber-800 font-medium mb-1">⚠️ Disclaimer</p>
                                <p className="text-xs text-amber-700">
                                    This notice is part of our routine quality and compliance review process. Providers are requested to review and update their listings accordingly. Continued non-compliance may lead to restricted visibility or removal of the service from the platform.
                                </p>
                            </div>

                            <div className="space-y-2 mb-4">
                                <label className="text-sm font-semibold text-gray-700">Select an issue</label>
                                {ADVICE_REASONS.map((reason) => (
                                    <label
                                        key={reason}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${adviceModal.reason === reason
                                            ? 'border-blue-300 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="adviceReasonGig"
                                            value={reason}
                                            checked={adviceModal.reason === reason}
                                            onChange={(e) => setAdviceModal(prev => ({ ...prev, reason: e.target.value, customReason: '' }))}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">{reason}</span>
                                    </label>
                                ))}
                            </div>

                            {adviceModal.reason === 'Other' && (
                                <div className="mb-4">
                                    <textarea
                                        value={adviceModal.customReason}
                                        onChange={(e) => setAdviceModal(prev => ({ ...prev, customReason: e.target.value }))}
                                        placeholder="Describe the issue..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-gray-900 placeholder-gray-400 resize-none"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setAdviceModal({ show: false, reason: '', customReason: '', loading: false })}
                                    disabled={adviceModal.loading}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        const reason = adviceModal.reason === 'Other' ? adviceModal.customReason : adviceModal.reason;
                                        if (!reason.trim()) {
                                            showNotification('Please select or enter a reason', 'error');
                                            return;
                                        }
                                        setAdviceModal(prev => ({ ...prev, loading: true }));
                                        try {
                                            const auth = JSON.parse(localStorage.getItem('authData'));
                                            const response = await fetch(`${import.meta.env.VITE_API_URL}/services/admin/${id}/status`, {
                                                method: 'PATCH',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': `Bearer ${auth?.token}`
                                                },
                                                body: JSON.stringify({ status: 'ADVICED', reason })
                                            });
                                            const data = await response.json();
                                            if (data.success) {
                                                setService(prev => ({ ...prev, status: 'ADVICED' }));
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
                                    }}
                                    disabled={adviceModal.loading || !adviceModal.reason || (adviceModal.reason === 'Other' && !adviceModal.customReason.trim())}
                                    className={`flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-2 ${adviceModal.loading || !adviceModal.reason || (adviceModal.reason === 'Other' && !adviceModal.customReason.trim())
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                        }`}
                                >
                                    {adviceModal.loading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
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

export default GigDetails;
