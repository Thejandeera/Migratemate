import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { searchServices, getAllServices, getServiceById } from '../utils/serviceApi';
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
    const navigate = useNavigate();
    const {
        id,
        title,
        category,
        price,
        currency,
        averageRating = 0,
        totalReviews = 0,
        destination,
        specificLocation,
        imageUrls = [],
        providerName,
        providerProfilePicture,
        description,
        isVerified = true,
    } = service;

    // Get display name for category
    const categoryDisplay = CATEGORY_MAP[category]?.name || category;

    // Get first image or use placeholder
    const displayImage = imageUrls?.[0] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000';

    // Format price display
    const priceDisplay = currency ? `${price?.toFixed(0) || 0} ${currency}` : `${price?.toFixed(0) || 0}`;

    // Get provider initial
    const providerInitial = providerName?.charAt(0)?.toUpperCase() || 'P';

    // Location display - prefer specificLocation, then destination
    const locationDisplay = specificLocation || destination || 'Location TBD';

    // Handle card click to navigate to service detail
    const handleCardClick = () => {
        navigate(`/service/${id}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onClick={handleCardClick}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-md group cursor-pointer h-full"
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={displayImage}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000';
                    }}
                />
                {/* Price Badge */}
                <div className="absolute top-3 right-3">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-900 shadow-sm">
                        {priceDisplay}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Category & Rating */}
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-[#22C55E] uppercase tracking-wide">
                        {categoryDisplay}
                    </span>
                    <div className="flex items-center text-yellow-400 text-sm font-bold">
                        <Star className="w-4 h-4 fill-current mr-1" />
                        {averageRating?.toFixed(1) || '0.0'}
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#22C55E] transition-colors">
                    {title}
                </h3>

                {/* Location */}
                <div className="flex items-center text-gray-500 text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-1.5" />
                    {locationDisplay}
                </div>

                {/* Provider Section */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        {providerProfilePicture ? (
                            <img
                                src={providerProfilePicture}
                                alt={providerName}
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div
                            className={`w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-sm ${providerProfilePicture ? 'hidden' : ''}`}
                        >
                            {providerInitial}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                            {providerName || 'Provider'}
                        </span>
                    </div>
                    {isVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// Filter Sidebar Component
const FilterSidebar = ({ selectedCategory, setSelectedCategory, selectedLocation, setSelectedLocation, priceRange, setPriceRange, verifiedOnly, setVerifiedOnly }) => {
    // Price range options
    const PRICE_RANGES = [
        { label: 'Any Price', value: 200, id: 'any' },
        { label: 'Under $50', value: 50, id: 'under-50' },
        { label: '$50 - $100', value: 100, id: '50-100' },
        { label: '$100+', value: 200, id: 'over-100' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <Filter className="w-5 h-5 text-gray-400" />
            </div>

            {/* Categories */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Category</h3>
                <div className="space-y-3">
                    {CATEGORIES.map((cat) => (
                        <label
                            key={cat.name}
                            className="flex items-center group cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={selectedCategory === cat.value}
                                onChange={() => setSelectedCategory(selectedCategory === cat.value ? null : cat.value)}
                                className="w-4 h-4 text-[#22C55E] border-gray-300 rounded focus:ring-[#22C55E] cursor-pointer accent-[#22C55E]"
                            />
                            <div className="ml-3 flex items-center gap-2">
                                <cat.icon className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                <span className="text-gray-600 group-hover:text-gray-900 text-sm">
                                    {cat.name}
                                </span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Location */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Location</h3>
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
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Price Range</h3>
                <div className="space-y-3">
                    {PRICE_RANGES.map((item) => (
                        <label
                            key={item.id}
                            className="flex items-center group cursor-pointer"
                        >
                            <input
                                type="radio"
                                name="price"
                                id={item.id}
                                checked={priceRange === item.value}
                                onChange={() => setPriceRange(item.value)}
                                className="w-4 h-4 text-[#22C55E] border-gray-300 focus:ring-[#22C55E] cursor-pointer accent-[#22C55E]"
                            />
                            <span className="ml-3 text-gray-600 group-hover:text-gray-900 text-sm">
                                {item.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Verified Only Toggle */}
            <div>
                <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-semibold text-gray-900">Verified Helpers Only</span>
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

    const [visibleCount, setVisibleCount] = useState(6);

    // Fetch services from API based on filters
    const fetchServices = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Priority 1: Check if search query is a specific Service ID
            // MongoDB ObjectId pattern: 24 hex characters
            if (searchQuery && /^[0-9a-fA-F]{24}$/.test(searchQuery)) {
                try {
                    const service = await getServiceById(searchQuery);
                    if (service) {
                        setServices([service]);
                        setVisibleCount(6);
                        setLoading(false);
                        return; // Stop here if found by ID
                    }
                } catch (e) {
                    // If ID lookup fails, continue to normal search
                    console.log("Detail lookup failed, falling back to search");
                }
            }

            // Priority 2: Check if search query matches a Category name
            // If user types "Transport", treat it as a category filter
            let overrideCategory = selectedCategory;
            let overrideSearchTerm = searchQuery;

            if (searchQuery && !selectedCategory) {
                const normalizedQuery = searchQuery.trim().toLowerCase();
                const matchedCategory = CATEGORIES.find(cat =>
                    cat.name.toLowerCase() === normalizedQuery ||
                    (cat.value && cat.value.toLowerCase() === normalizedQuery)
                );

                if (matchedCategory && matchedCategory.value) {
                    overrideCategory = matchedCategory.value;
                    overrideSearchTerm = ''; // Clear term so we get all items in that category
                }
            }

            // Build filter object for API search
            const filters = {
                category: overrideCategory || undefined,
                maxPrice: priceRange < 200 ? priceRange : undefined,
                searchTerm: overrideSearchTerm || undefined,
                destination: selectedLocation !== 'All Locations' ? selectedLocation : undefined,
                availableOnly: true,
            };

            const data = await searchServices(filters);
            // Filter out inactive services (double-check on frontend)
            const activeServices = (data || []).filter(s => s.isAvailable !== false && s.available !== false);
            setServices(activeServices);
            setVisibleCount(6); // Reset pagination on filter change
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
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans relative">
            <Navbar />

            {/* Top gradient shadow */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/10 to-transparent pointer-events-none z-10"></div>

            <main className="flex-grow">
                {/* Hero / Search Section */}
                <div className="pb-8 pt-32 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Service Marketplace
                                </h1>
                                <p className="text-gray-500">
                                    Find trusted help for your move.
                                </p>
                            </div>
                            <div className="w-full md:w-96">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search services..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#22C55E] focus:border-[#22C55E] outline-none transition-all"
                                    />
                                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar */}
                        <aside className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-24 h-fit">
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

                        {/* Grid */}
                        <div className="flex-1">
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

                            {/* Services Grid */}
                            {!loading && !error && services.length > 0 && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {services.slice(0, visibleCount).map((service) => (
                                            <ServiceCard key={service.id} service={service} />
                                        ))}
                                    </div>

                                    {/* Load More Button */}
                                    {visibleCount < services.length && (
                                        <div className="flex justify-center mt-10">
                                            <button
                                                onClick={() => setVisibleCount(prev => prev + 6)}
                                                className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-50 hover:border-[#22C55E] hover:text-[#22C55E] transition-all shadow-sm"
                                            >
                                                Load More Services
                                            </button>
                                        </div>
                                    )}
                                </>
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
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating Chat Bot */}


            <Footer />
        </div>
    );
};

export default MarketPlace;
