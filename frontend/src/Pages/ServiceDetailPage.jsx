import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getServiceById } from '../utils/serviceApi';
import {
    ArrowLeft,
    MapPin,
    Star,
    Bot,
    Clock,
    Users,
    Calendar,
    CheckCircle,
    Loader2,
    AlertCircle,
    RefreshCw,
    DollarSign,
    MessageCircle
} from 'lucide-react';

// Category display names
const CATEGORY_NAMES = {
    'TRANSPORT': 'Transport',
    'HOUSING': 'Housing',
    'DOCUMENTATION': 'Documentation',
    'CULTURAL_SUPPORT': 'Cultural Support',
};

// Pricing type display
const PRICING_TYPE_NAMES = {
    'FIXED': 'Fixed Price',
    'HOURLY': 'Per Hour',
    'NEGOTIABLE': 'Negotiable',
};

// Duration type display
const DURATION_TYPE_NAMES = {
    'MINUTES': 'min',
    'HOURS': 'hrs',
    'DAYS': 'days',
};

// Badge Component
const Badge = ({ children, className = '' }) => (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${className}`}>
        {children}
    </span>
);

// Review Card Component (placeholder - can be enhanced when reviews API is available)
const ReviewCard = ({ name, initial, date, rating, text }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#22C55E] to-[#16A34A] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                {initial}
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h4 className="font-semibold text-gray-900">{name}</h4>
                        <p className="text-xs text-gray-400">{date}</p>
                    </div>
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                            />
                        ))}
                    </div>
                </div>
                <p className="text-gray-600 text-sm">{text}</p>
            </div>
        </div>
    </div>
);

// Booking Card Component
const BookingCard = ({ service }) => {
    const priceDisplay = `$${service.price?.toFixed(0) || 0} ${service.currency || 'AUD'}`;
    const pricingType = PRICING_TYPE_NAMES[service.pricingType] || service.pricingType;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
            {/* Header with Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-2">
                Book this Service
            </h3>

            {/* Price Display */}
            <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-bold text-[#22C55E]">{priceDisplay}</span>
                <span className="text-sm text-gray-500">{pricingType}</span>
            </div>

            {/* Booking Form */}
            <div className="space-y-4">
                {/* Date Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Date
                    </label>
                    <div className="relative">
                        <input
                            type="date"
                            className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#22C55E] focus:border-[#22C55E] outline-none transition-all text-gray-700"
                        />
                        <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Message Textarea */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message to Helper
                    </label>
                    <textarea
                        rows={3}
                        placeholder="Describe your needs..."
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#22C55E] focus:border-[#22C55E] outline-none transition-all resize-none text-gray-700 placeholder-gray-400"
                    />
                </div>

                {/* Request Booking Button */}
                <button className="w-full py-3 bg-[#22C55E] text-white font-semibold rounded-xl hover:bg-[#16A34A] transition-colors shadow-lg shadow-[#22C55E]/20 mt-2">
                    Request Booking
                </button>

                {/* Note */}
                <p className="text-xs text-center text-gray-500 mt-3">
                    You won't be charged yet
                </p>
            </div>
        </div>
    );
};

// Provider Profile Card Component
const ProviderProfileCard = ({ service }) => {
    const providerInitial = service.providerName?.charAt(0)?.toUpperCase() || 'P';

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            {/* Provider Info */}
            <div className="flex items-start gap-4 mb-6">
                {service.providerProfilePicture ? (
                    <img
                        src={service.providerProfilePicture}
                        alt={service.providerName}
                        className="w-12 h-12 rounded-full object-cover shadow-md"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div
                    className={`w-12 h-12 bg-gradient-to-br from-[#22C55E] to-[#16A34A] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${service.providerProfilePicture ? 'hidden' : ''}`}
                >
                    {providerInitial}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">{service.providerName || 'Provider'}</h3>
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Verified Helper
                    </span>
                </div>
            </div>

            {/* Provider Stats */}
            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                    <span>Identity Verified</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>{service.averageRating?.toFixed(1) || '0.0'} Average Rating</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span>Response time: &lt; 1 hour</span>
                </div>
            </div>

            {/* View Profile Button */}
            <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
                View Full Profile
            </button>
        </div>
    );
};

// Main ServiceDetailPage Component
const ServiceDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch service data
    useEffect(() => {
        const fetchService = async () => {
            if (!id) {
                setError('Service ID not provided');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const data = await getServiceById(id);
                setService(data);
            } catch (err) {
                console.error('Failed to fetch service:', err);
                setError(err.message || 'Failed to load service details');
            } finally {
                setLoading(false);
            }
        };

        fetchService();
    }, [id]);

    // Get category display name
    const categoryDisplay = service?.category ? (CATEGORY_NAMES[service.category] || service.category) : '';

    // Get first image or placeholder
    const heroImage = service?.imageUrls?.[0] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1200';

    // Location display
    const locationDisplay = service?.specificLocation || service?.destination || 'Location TBD';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow pt-20 pb-16">
                {/* Back Navigation */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Link
                        to="/marketplace"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-[#22C55E] font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Marketplace
                    </Link>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center justify-center py-24">
                            <Loader2 className="w-12 h-12 text-[#22C55E] animate-spin mb-4" />
                            <p className="text-gray-500 font-medium">Loading service details...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center py-24">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to load service</h3>
                            <p className="text-gray-500 mb-6">{error}</p>
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    onClick={() => navigate('/marketplace')}
                                    className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Back to Marketplace
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-2.5 bg-[#22C55E] text-white font-semibold rounded-lg hover:bg-[#16A34A] transition-colors inline-flex items-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Service Content */}
                {!loading && !error && service && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
                    >
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Main Content */}
                            <div className="flex-1">
                                {/* Hero Image */}
                                <div className="relative h-[400px] rounded-2xl overflow-hidden mb-8 shadow-sm">
                                    <img
                                        src={heroImage}
                                        alt={service.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1200';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                                    <div className="absolute top-6 left-6">
                                        <Badge className="bg-white/90 backdrop-blur text-gray-900 shadow-sm">
                                            {categoryDisplay}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Image Gallery (if multiple images) */}
                                {service.imageUrls && service.imageUrls.length > 1 && (
                                    <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                                        {service.imageUrls.map((url, index) => (
                                            <img
                                                key={index}
                                                src={url}
                                                alt={`${service.title} - ${index + 1}`}
                                                className="w-24 h-24 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-[#22C55E] transition-all"
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Title Header */}
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-3">
                                            {service.title}
                                        </h1>
                                        <div className="flex items-center gap-4 text-sm flex-wrap">
                                            <div className="flex items-center text-gray-600">
                                                <MapPin className="w-4 h-4 mr-1.5" />
                                                {locationDisplay}
                                            </div>
                                            <div className="flex items-center text-yellow-500 font-medium">
                                                <Star className="w-4 h-4 fill-current mr-1.5" />
                                                {service.averageRating?.toFixed(1) || '0.0'}
                                                <span className="text-gray-400 font-normal ml-1">
                                                    ({service.totalReviews || 0} reviews)
                                                </span>
                                            </div>
                                            {service.origin && (
                                                <div className="text-gray-500">
                                                    From: <span className="font-medium">{service.origin}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-[#22C55E]">
                                        ${service.price?.toFixed(0) || 0} {service.currency || 'AUD'}
                                    </div>
                                </div>

                                {/* About Section */}
                                <section className="mb-12">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                                        About this service
                                    </h2>
                                    <div className="prose prose-gray max-w-none text-gray-600">
                                        <p className="whitespace-pre-line">{service.description}</p>
                                    </div>
                                </section>

                                {/* Features Section */}
                                {service.features && service.features.length > 0 && (
                                    <section className="mb-12">
                                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                                            What's included
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {service.features.map((feature, index) => (
                                                <div key={index} className="flex items-center gap-3 text-gray-600">
                                                    <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Reviews Section */}
                                <section>
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                                        Client Reviews
                                    </h2>
                                    {service.totalReviews && service.totalReviews > 0 ? (
                                        <div className="space-y-4">
                                            {/* Placeholder reviews - will be replaced when reviews API is available */}
                                            <ReviewCard
                                                name="Happy Customer"
                                                initial="H"
                                                date="Recently"
                                                rating={5}
                                                text="Great service! Highly recommended."
                                            />
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-xl p-8 text-center">
                                            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <h4 className="font-semibold text-gray-900 mb-2">No reviews yet</h4>
                                            <p className="text-gray-500 text-sm">Be the first to review this service!</p>
                                        </div>
                                    )}
                                </section>
                            </div>

                            {/* Sidebar */}
                            <div className="w-full lg:w-[380px] flex-shrink-0 space-y-6">
                                <BookingCard service={service} />
                                <ProviderProfileCard service={service} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>

            {/* Floating Chat Bot */}
            <button className="fixed bottom-8 right-8 w-14 h-14 bg-[#22C55E] rounded-full shadow-xl flex items-center justify-center text-white hover:bg-[#16A34A] transition-all z-40 hover:scale-110 duration-200 group">
                <Bot className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-12 right-0 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Need help? Chat with AI
                </span>
            </button>

            <Footer />
        </div>
    );
};

export default ServiceDetailPage;
