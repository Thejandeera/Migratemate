import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { searchServices, getAllServices } from '../utils/serviceApi';
import {
    Search,
    Bot,
    Star,
    MapPin,
    CheckCircle,
    Filter,
    SlidersHorizontal,
    ChevronDown,
    Plane,
    Home,
    Briefcase,
    MessageCircle,
    FileText,
    X,
    Loader2,
    AlertCircle,
    RefreshCw
} from 'lucide-react';

// Map backend categories to display names and icons
const CATEGORY_MAP = {
    'TRANSPORT': { name: 'Transport', icon: Plane },
    'HOUSING': { name: 'Housing', icon: Home },
    'DOCUMENTATION': { name: 'Documentation', icon: FileText },
    'CULTURAL_SUPPORT': { name: 'Cultural Support', icon: MessageCircle },
};

const CATEGORIES = [
    { name: 'All Categories', value: null, icon: SlidersHorizontal },
    { name: 'Transport', value: 'TRANSPORT', icon: Plane },
    { name: 'Housing', value: 'HOUSING', icon: Home },
    { name: 'Documentation', value: 'DOCUMENTATION', icon: FileText },
    { name: 'Cultural Support', value: 'CULTURAL_SUPPORT', icon: MessageCircle },
];

const LOCATIONS = ['All Locations', 'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Online'];

// Service Card Component - adapted for API data format
const ServiceCard = ({ service }) => {
    const {
        id,
        title,
        category,
        price,
        currency = 'AUD',
        averageRating = 0,
        totalReviews = 0,
        destination,
        specificLocation,
        imageUrls = [],
        providerName,
        providerProfilePicture,
        description,
    } = service;

    // Get display name for category
    const categoryDisplay = CATEGORY_MAP[category]?.name || category;

    // Get first image or use placeholder
    const displayImage = imageUrls?.[0] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000';

    // Format price display
    const priceDisplay = `$${price?.toFixed(0) || 0} ${currency}`;

    // Get provider initial
    const providerInitial = providerName?.charAt(0)?.toUpperCase() || 'P';

    // Location display - prefer specificLocation, then destination
    const locationDisplay = specificLocation || destination || 'Location TBD';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={displayImage}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 rounded-full">
                        {categoryDisplay}
                    </span>
                </div>

                {/* Price Badge */}
                <div className="absolute bottom-3 right-3">
                    <span className="px-3 py-1.5 bg-[#22C55E] text-white text-sm font-bold rounded-lg shadow-lg">
                        {priceDisplay}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-[#22C55E] transition-colors">
                    {title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {description}
                </p>

                {/* Rating & Location */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-semibold text-gray-900">{averageRating?.toFixed(1) || '0.0'}</span>
                        <span className="text-xs text-gray-400">({totalReviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs font-medium">{locationDisplay}</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 pt-4">
                    {/* Provider */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {providerProfilePicture ? (
                                <img
                                    src={providerProfilePicture}
                                    alt={providerName}
                                    className="w-10 h-10 rounded-full object-cover shadow-md"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div
                                className={`w-10 h-10 bg-gradient-to-br from-[#22C55E] to-[#16A34A] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${providerProfilePicture ? 'hidden' : ''}`}
                            >
                                {providerInitial}
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-semibold text-gray-900">{providerName || 'Provider'}</span>
                                    <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                                </div>
                                <span className="text-xs text-gray-400">Helper</span>
                            </div>
                        </div>
                        <Link
                            to={`/service/${id}`}
                            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-[#22C55E] hover:text-white transition-all duration-200"
                        >
                            View
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Filter Sidebar Component
const FilterSidebar = ({ selectedCategory, setSelectedCategory, selectedLocation, setSelectedLocation, priceRange, setPriceRange, verifiedOnly, setVerifiedOnly }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                <button className="text-xs font-medium text-[#22C55E] hover:underline">
                    Reset All
                </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Category</h4>
                <div className="space-y-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.name}
                            onClick={() => setSelectedCategory(cat.value)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat.value
                                ? 'bg-[#22C55E]/10 text-[#16A34A] border border-[#22C55E]/20'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <cat.icon className="w-4 h-4" />
                                <span>{cat.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Location */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Location</h4>
                <div className="relative">
                    <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#22C55E] focus:border-[#22C55E] outline-none appearance-none cursor-pointer"
                    >
                        {LOCATIONS.map((loc) => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Price Range</h4>
                <div className="space-y-3">
                    <input
                        type="range"
                        min="0"
                        max="200"
                        value={priceRange}
                        onChange={(e) => setPriceRange(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#22C55E]"
                    />
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">$0</span>
                        <span className="font-semibold text-[#22C55E]">${priceRange} AUD</span>
                        <span className="text-gray-500">$200+</span>
                    </div>
                </div>
            </div>

            {/* Verified Only Toggle */}
            <div className="mb-6">
                <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-semibold text-gray-700">Verified Helpers Only</span>
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={verifiedOnly}
                            onChange={(e) => setVerifiedOnly(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#22C55E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22C55E]"></div>
                    </div>
                </label>
            </div>

            {/* Apply Button */}
            <button className="w-full py-3 bg-[#22C55E] text-white font-semibold rounded-xl hover:bg-[#16A34A] transition-colors shadow-lg shadow-[#22C55E]/20">
                Apply Filters
            </button>
        </div>
    );
};

// Main MarketPlace Component
const MarketPlace = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null); // null = All Categories
    const [selectedLocation, setSelectedLocation] = useState('All Locations');
    const [priceRange, setPriceRange] = useState(200);
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // API state
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch services from API based on filters
    const fetchServices = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Build filter object for API search
            const filters = {
                category: selectedCategory || undefined,
                maxPrice: priceRange < 200 ? priceRange : undefined,
                searchTerm: searchQuery || undefined,
                destination: selectedLocation !== 'All Locations' ? selectedLocation : undefined,
                availableOnly: true,
            };

            const data = await searchServices(filters);
            setServices(data || []);
        } catch (err) {
            console.error('Failed to fetch services:', err);
            setError(err.message || 'Failed to load services');
            setServices([]);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, priceRange, searchQuery, selectedLocation]);

    // Initial fetch and refetch when filters change
    useEffect(() => {
        // Debounce search queries to avoid too many API calls
        const timeoutId = setTimeout(() => {
            fetchServices();
        }, searchQuery ? 300 : 0); // Debounce only for search queries

        return () => clearTimeout(timeoutId);
    }, [fetchServices]);

    // Reset filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedCategory(null);
        setSelectedLocation('All Locations');
        setPriceRange(200);
        setVerifiedOnly(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />

            <main className="pt-24">
                {/* Hero / Search Section */}

                {/* Main Content */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Mobile Filter Button */}
                        <div className="lg:hidden">
                            <button
                                onClick={() => setMobileFiltersOpen(true)}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                            </button>
                        </div>

                        {/* Desktop Sidebar */}
                        <aside className="hidden lg:block w-72 flex-shrink-0">
                            <FilterSidebar
                                selectedCategory={selectedCategory}
                                setSelectedCategory={setSelectedCategory}
                                selectedLocation={selectedLocation}
                                setSelectedLocation={setSelectedLocation}
                                priceRange={priceRange}
                                setPriceRange={setPriceRange}
                                verifiedOnly={verifiedOnly}
                                setVerifiedOnly={setVerifiedOnly}
                            />
                        </aside>

                        {/* Mobile Filter Modal */}
                        <AnimatePresence>
                            {mobileFiltersOpen && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setMobileFiltersOpen(false)}
                                        className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                                    />
                                    <motion.div
                                        initial={{ x: '-100%' }}
                                        animate={{ x: 0 }}
                                        exit={{ x: '-100%' }}
                                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                        className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 lg:hidden overflow-y-auto"
                                    >
                                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                            <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                                            <button
                                                onClick={() => setMobileFiltersOpen(false)}
                                                className="p-2 text-gray-500 hover:text-gray-700"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="p-4">
                                            <FilterSidebar
                                                selectedCategory={selectedCategory}
                                                setSelectedCategory={setSelectedCategory}
                                                selectedLocation={selectedLocation}
                                                setSelectedLocation={setSelectedLocation}
                                                priceRange={priceRange}
                                                setPriceRange={setPriceRange}
                                                verifiedOnly={verifiedOnly}
                                                setVerifiedOnly={setVerifiedOnly}
                                            />
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>

                        {/* Services Grid */}
                        <div className="flex-1">
                            {/* Results Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {loading ? 'Loading...' : `${services.length} Services Found`}
                                </h2>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-500">Sort by:</span>
                                    <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#22C55E] outline-none cursor-pointer">
                                        <option>Recommended</option>
                                        <option>Price: Low to High</option>
                                        <option>Price: High to Low</option>
                                        <option>Rating</option>
                                        <option>Most Reviews</option>
                                    </select>
                                </div>
                            </div>

                            {/* Loading State */}
                            {loading && (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <Loader2 className="w-12 h-12 text-[#22C55E] animate-spin mb-4" />
                                    <p className="text-gray-500 font-medium">Loading services...</p>
                                </div>
                            )}

                            {/* Error State */}
                            {error && !loading && (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <AlertCircle className="w-8 h-8 text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to load services</h3>
                                    <p className="text-gray-500 mb-6">{error}</p>
                                    <button
                                        onClick={fetchServices}
                                        className="px-6 py-2.5 bg-[#22C55E] text-white font-semibold rounded-lg hover:bg-[#16A34A] transition-colors inline-flex items-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Try Again
                                    </button>
                                </div>
                            )}

                            {/* Grid */}
                            {!loading && !error && services.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {services.map((service, index) => (
                                        <motion.div
                                            key={service.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: index * 0.05 }}
                                        >
                                            <ServiceCard service={service} />
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Empty State */}
                            {!loading && !error && services.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Search className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No services found</h3>
                                    <p className="text-gray-500 mb-6">Try adjusting your filters or search query</p>
                                    <button
                                        onClick={handleResetFilters}
                                        className="px-6 py-2.5 bg-[#22C55E] text-white font-semibold rounded-lg hover:bg-[#16A34A] transition-colors"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            )}

                            {/* Load More */}
                            {!loading && !error && services.length > 0 && (
                                <div className="mt-10 text-center">
                                    <button className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
                                        Load More Services
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
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

export default MarketPlace;
