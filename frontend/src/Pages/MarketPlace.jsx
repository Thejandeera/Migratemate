import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { searchServices, getAllServices, getServiceById } from '../utils/serviceApi';
import {
    Search,
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
    Loader2,
    AlertCircle,
    RefreshCw,
    X
} from 'lucide-react';

// Map backend categories to display names and icons
const CATEGORY_MAP = {
    'TRANSPORT': { name: 'Transport', icon: Plane, color: 'text-blue-600', bg: 'bg-blue-50' },
    'HOUSING': { name: 'Housing', icon: Home, color: 'text-green-600', bg: 'bg-green-50' },
    'DOCUMENTATION': { name: 'Documentation', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    'CULTURAL_SUPPORT': { name: 'Cultural Support', icon: MessageCircle, color: 'text-pink-600', bg: 'bg-pink-50' },
};

const CATEGORIES = [
    { name: 'All Categories', value: null, icon: SlidersHorizontal },
    { name: 'Transport', value: 'TRANSPORT', icon: Plane },
    { name: 'Housing', value: 'HOUSING', icon: Home },
    { name: 'Documentation', value: 'DOCUMENTATION', icon: FileText },
    { name: 'Cultural Support', value: 'CULTURAL_SUPPORT', icon: MessageCircle },
];

const LOCATIONS = ['All Locations', 'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Online'];

// Service Card Component
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
        isVerified = true,
    } = service;

    const categoryConfig = CATEGORY_MAP[category] || { name: category, icon: Briefcase, color: 'text-gray-600', bg: 'bg-gray-50' };
    const CategoryIcon = categoryConfig.icon;
    const displayImage = imageUrls?.[0] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000';
    const priceDisplay = currency ? `${price?.toFixed(0) || 0} ${currency}` : `${price?.toFixed(0) || 0}`;
    const providerInitial = providerName?.charAt(0)?.toUpperCase() || 'P';
    const locationDisplay = specificLocation || destination || 'Online';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            onClick={() => navigate(`/service/${id}`)}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={displayImage}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000'; }}
                />
                <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${categoryConfig.bg} ${categoryConfig.color} shadow-sm backdrop-blur-md bg-opacity-90`}>
                        <CategoryIcon className="w-3.5 h-3.5" />
                        {categoryConfig.name}
                    </span>
                </div>
                <div className="absolute bottom-3 right-3">
                    <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm font-bold text-gray-900 shadow-lg">
                        {priceDisplay}
                    </span>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-lg">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                        {locationDisplay}
                    </div>
                    <div className="flex items-center text-yellow-500 text-xs font-bold bg-yellow-50 px-2 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 fill-current mr-1" />
                        {averageRating?.toFixed(1)} <span className="text-gray-400 font-normal ml-1">({totalReviews})</span>
                    </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                    {title}
                </h3>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        {providerProfilePicture ? (
                            <img src={providerProfilePicture} alt={providerName} className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-green-700 font-bold text-xs ring-2 ring-white shadow-sm">
                                {providerInitial}
                            </div>
                        )}
                        <span className="text-sm font-semibold text-gray-700 truncate max-w-[100px]">{providerName}</span>
                    </div>
                    {isVerified && (
                        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full" title="Verified Provider">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Verified</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// Filter Sidebar
const FilterSidebar = ({ selectedCategory, setSelectedCategory, selectedLocation, setSelectedLocation, priceRange, setPriceRange, verifiedOnly, setVerifiedOnly }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    Filters
                </h2>
                {(selectedCategory || selectedLocation !== 'All Locations' || verifiedOnly) && (
                    <button
                        onClick={() => { setSelectedCategory(null); setSelectedLocation('All Locations'); setVerifiedOnly(false); setPriceRange(200); }}
                        className="text-xs font-semibold text-green-600 hover:text-green-700 hover:underline"
                    >
                        Reset All
                    </button>
                )}
            </div>

            <div className="space-y-8">
                {/* Categories */}
                <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Category</h3>
                    <div className="space-y-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => setSelectedCategory(selectedCategory === cat.value ? null : cat.value)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all group ${selectedCategory === cat.value
                                        ? 'bg-green-50 text-green-700 font-semibold'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <cat.icon className={`w-4 h-4 ${selectedCategory === cat.value ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                    <span>{cat.name}</span>
                                </div>
                                {selectedCategory === cat.value && <CheckCircle className="w-4 h-4 text-green-600" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Location */}
                <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Location</h3>
                    <div className="relative">
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none appearance-none cursor-pointer transition-all hover:bg-white"
                        >
                            {LOCATIONS.map((loc) => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Price Range */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Max Price</h3>
                        <span className="text-sm font-bold text-green-600">${priceRange}</span>
                    </div>
                    <input
                        type="range"
                        min="50"
                        max="500"
                        step="50"
                        value={priceRange}
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                    <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium">
                        <span>$50</span>
                        <span>$500+</span>
                    </div>
                </div>

                {/* Verified Toggle */}
                <div className="bg-green-50/50 rounded-xl p-4 border border-green-100">
                    <label className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-1.5 rounded-lg shadow-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors">Verified Only</span>
                        </div>
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={verifiedOnly}
                                onChange={(e) => setVerifiedOnly(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 shadow-inner"></div>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
};

const MarketPlace = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState('All Locations');
    const [priceRange, setPriceRange] = useState(200);
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visibleCount, setVisibleCount] = useState(6);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const fetchServices = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (searchQuery && /^[0-9a-fA-F]{24}$/.test(searchQuery)) {
                try {
                    const service = await getServiceById(searchQuery);
                    if (service) {
                        setServices([service]);
                        setVisibleCount(6);
                        setLoading(false);
                        return;
                    }
                } catch (e) { console.log("Detail lookup failed, falling back"); }
            }

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
                    overrideSearchTerm = '';
                }
            }

            const filters = {
                category: overrideCategory || undefined,
                maxPrice: priceRange < 500 ? priceRange : undefined,
                searchTerm: overrideSearchTerm || undefined,
                destination: selectedLocation !== 'All Locations' ? selectedLocation : undefined,
                availableOnly: true,
            };

            const data = await searchServices(filters);
            const activeServices = (data || []).filter(s => s.isAvailable !== false && s.available !== false);
            setServices(activeServices);
            setVisibleCount(6);
        } catch (err) {
            console.error('Failed to fetch services:', err);
            setError(err.message || 'Failed to load services');
            setServices([]);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, priceRange, searchQuery, selectedLocation]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchServices();
        }, searchQuery ? 300 : 0);
        return () => clearTimeout(timeoutId);
    }, [fetchServices]);

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans relative">
            <Navbar />

            {/* Background Decoration */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <main className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="max-w-7xl mx-auto mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-2xl mx-auto mb-10"
                    >
                        <span className="text-green-600 font-bold tracking-wider uppercase text-xs mb-2 block">Marketplace</span>
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                            Find Verified <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Services</span>
                        </h1>
                        <p className="text-lg text-gray-500">
                            Connect with verified locals for housing, transport, and support. Safe, secure, and easy.
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-2xl mx-auto relative z-20"
                    >
                        <div className="relative group">
                            <div className="absolute inset-0 bg-green-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <div className="relative bg-white rounded-2xl shadow-lg flex items-center p-2 border border-gray-100">
                                <div className="pl-4 text-gray-400">
                                    <Search className="w-6 h-6" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for 'Housing', 'Transport', or specific needs..."
                                    className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 text-base"
                                />
                                <button className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-md">
                                    Search
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="max-w-7xl mx-auto">
                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden mb-6">
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-700 shadow-sm"
                        >
                            <Filter className="w-5 h-5" />
                            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar */}
                        <aside className={`lg:w-72 flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
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

                        {/* Results */}
                        <div className="flex-1">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-4" />
                                    <p className="text-gray-500 font-medium">Finding the best matches...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-20 bg-white rounded-3xl border border-red-100">
                                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="w-8 h-8 text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
                                    <p className="text-gray-500 mb-6">{error}</p>
                                    <button onClick={fetchServices} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">Try Again</button>
                                </div>
                            ) : services.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No services found</h3>
                                    <p className="text-gray-500 mb-6 max-w-md mx-auto">We couldn't find matches for your current filters. Try adjusting your search or filters.</p>
                                    <button
                                        onClick={() => { setSearchQuery(''); setSelectedCategory(null); setSelectedLocation('All Locations'); }}
                                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {services.slice(0, visibleCount).map((service) => (
                                            <ServiceCard key={service.id} service={service} />
                                        ))}
                                    </div>

                                    {visibleCount < services.length && (
                                        <div className="mt-12 text-center">
                                            <button
                                                onClick={() => setVisibleCount(prev => prev + 6)}
                                                className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-full shadow-sm hover:shadow-md hover:border-green-500 hover:text-green-600 transition-all"
                                            >
                                                Load More Results
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default MarketPlace;
