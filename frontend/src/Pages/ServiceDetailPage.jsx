import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getServiceById } from '../utils/serviceApi';
import { createBooking } from '../utils/bookingApi';
import { isAuthenticated } from '../utils/auth';
import {
    ArrowLeft,
    MapPin,
    Star,
    CheckCircle,
    Loader2,
    AlertCircle,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Shield,
    Clock,
    User,
    MessageCircle
} from 'lucide-react';

const CATEGORY_NAMES = {
    'TRANSPORT': 'Transport',
    'HOUSING': 'Housing',
    'DOCUMENTATION': 'Documentation',
    'CULTURAL_SUPPORT': 'Cultural Support',
};

const BookingCard = ({ service }) => {
    const priceDisplay = service.currency ? `${service.price?.toFixed(0) || 0} ${service.currency}` : `${service.price?.toFixed(0) || 0}`;
    const navigate = useNavigate();
    const [bookingDate, setBookingDate] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const handleBooking = async () => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        if (!bookingDate) {
            alert("Please select a date");
            return;
        }

        setIsSubmitting(true);
        setStatus(null);
        setErrorMessage('');

        try {
            await createBooking({
                serviceId: service.id,
                date: bookingDate,
                notes: notes
            });
            setStatus('success');
            setBookingDate('');
            setNotes('');
        } catch (error) {
            console.error(error);
            setStatus('error');
            setErrorMessage(error.message || 'Failed to book service');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm lg:sticky lg:top-28">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Book Service</h3>

            <div className="flex items-baseline gap-2 mb-8 pb-8 border-b border-gray-100">
                <span className="text-4xl font-extrabold text-[#22C55E] tracking-tight">{priceDisplay}</span>
                <span className="text-sm font-medium text-gray-500">starting price</span>
            </div>

            <div className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Date</label>
                    <div className="relative">
                        <input
                            type="date"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-sm font-medium"
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Message</label>
                    <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Briefly describe what you need..."
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all resize-none text-sm"
                    />
                </div>

                <button
                    onClick={handleBooking}
                    disabled={isSubmitting}
                    className={`w-full py-4 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 hover:-translate-y-1 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-green-200'
                        }`}
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request Booking'}
                </button>

                {status === 'success' && (
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-medium flex items-start gap-3 border border-green-100 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Booking Sent!</p>
                            <p className="text-xs mt-1">Check your dashboard for updates.</p>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        {errorMessage}
                    </div>
                )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                <Shield className="w-3.5 h-3.5" />
                <span>Secure Booking Protected</span>
            </div>
        </div>
    );
};

const ServiceDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    useEffect(() => {
        const fetchService = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await getServiceById(id);
                setService(data);
            } catch (err) {
                setError(err.message || 'Failed to load service');
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id]);

    const handleImageNav = (direction) => {
        if (!service?.imageUrls || service.imageUrls.length <= 1) return;
        if (direction === 'next') {
            setSelectedImageIndex(prev => (prev === service.imageUrls.length - 1 ? 0 : prev + 1));
        } else {
            setSelectedImageIndex(prev => (prev === 0 ? service.imageUrls.length - 1 : prev - 1));
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
        </div>
    );

    if (error || !service) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h2>
            <p className="text-gray-500 mb-6">The service you are looking for may have been removed.</p>
            <button onClick={() => navigate('/marketplace')} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold">Go Back</button>
        </div>
    );

    const heroImage = service.imageUrls?.[selectedImageIndex] || service.imageUrls?.[0] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1200';
    const categoryName = CATEGORY_NAMES[service.category] || service.category;

    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <Link to="/marketplace" className="hover:text-green-600 transition-colors">Marketplace</Link>
                        <span>/</span>
                        <span className="text-gray-900 truncate max-w-xs">{service.title}</span>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                        {/* Left Column: Content */}
                        <div className="flex-1 min-w-0">

                            {/* Hero Gallery */}
                            <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-100 mb-8 group">
                                <motion.img
                                    key={selectedImageIndex}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    src={heroImage}
                                    className="w-full h-full object-cover"
                                    alt={service.title}
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm text-gray-900">
                                        {categoryName}
                                    </span>
                                </div>

                                {service.imageUrls && service.imageUrls.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => handleImageNav('prev')}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover:opacity-100 shadow-md"
                                        >
                                            <ChevronLeft className="w-5 h-5 text-gray-900" />
                                        </button>
                                        <button
                                            onClick={() => handleImageNav('next')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover:opacity-100 shadow-md"
                                        >
                                            <ChevronRight className="w-5 h-5 text-gray-900" />
                                        </button>
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                            {service.imageUrls.map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`h-1.5 rounded-full transition-all ${idx === selectedImageIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Title & Metadata */}
                            <div className="mb-8">
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{service.title}</h1>

                                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-medium">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        {service.specificLocation || service.destination || 'Online'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        <span className="text-gray-900 font-bold">{service.averageRating?.toFixed(1) || 'New'}</span>
                                        <span>({service.totalReviews || 0} reviews)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="prose prose-lg prose-green max-w-none text-gray-600 mb-10">
                                <h3 className="text-gray-900 font-bold mb-3">About this Service</h3>
                                <p>{service.description}</p>
                            </div>

                            {/* Features */}
                            {service.features && service.features.length > 0 && (
                                <div className="mb-10 bg-gray-50 rounded-3xl p-8 border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-4">What's Included</h3>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {service.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-3 text-gray-600">
                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Provider Info */}
                            <div className="border border-gray-100 rounded-3xl p-8 flex items-center gap-6">
                                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                    {service.providerProfilePicture ? (
                                        <img src={service.providerProfilePicture} alt={service.providerName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl">
                                            {service.providerName?.charAt(0) || 'P'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg mb-1">{service.providerName}</h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1 text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                                            <Shield className="w-3 h-3" /> Identity Verified
                                        </span>
                                        <span>Member since 2024</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Right Column: Booking Widget */}
                        <div className="lg:w-[380px] flex-shrink-0">
                            <BookingCard service={service} />
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ServiceDetailPage;
