import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, MapPin, DollarSign, Calendar, Clock, Search, Filter, Loader2, AlertCircle } from 'lucide-react';
import CreateGigForm from './CreateGigForm';
import { getUserData } from '../../utils/auth';
import { motion, AnimatePresence } from 'framer-motion';

const MyGigs = () => {
    const [gigs, setGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingGig, setEditingGig] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, ACTIVE, INACTIVE

    const user = getUserData();

    const fetchGigs = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/services/provider/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                // Handle both direct array and wrapped response formats
                if (Array.isArray(data)) {
                    setGigs(data);
                } else if (data && Array.isArray(data.data)) {
                    setGigs(data.data);
                } else {
                    console.warn("Unexpected API response format:", data);
                    setGigs([]);
                }
            } else {
                setError('Failed to fetch your services');
            }
        } catch (err) {
            console.error('Error fetching gigs:', err);
            setError('An error occurred while loading your services');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchGigs();
        }
    }, [user?.id]);

    const handleCreateSuccess = (newGig, isEdit) => {
        if (isEdit) {
            setGigs(prev => prev.map(g => g.id === newGig.id ? newGig : g));
        } else {
            setGigs(prev => [newGig, ...prev]);
        }
        setIsCreateModalOpen(false);
        setEditingGig(null);
    };

    const handleDelete = async (gigId) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;

        try {
            const token = JSON.parse(sessionStorage.getItem('migratemate_auth') || localStorage.getItem('migratemate_auth'))?.token;
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/services/${gigId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setGigs(prev => prev.filter(g => g.id !== gigId));
            } else {
                alert('Failed to delete service');
            }
        } catch (err) {
            console.error('Error deleting gig:', err);
            alert('An error occurred');
        }
    };

    const toggleAvailability = async (gig) => {
        try {
            const token = JSON.parse(sessionStorage.getItem('migratemate_auth') || localStorage.getItem('migratemate_auth'))?.token;
            const updatedGig = { ...gig, isAvailable: !gig.isAvailable };

            // Optimistic update
            setGigs(prev => prev.map(g => g.id === gig.id ? updatedGig : g));

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/services/${gig.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedGig)
            });

            if (!response.ok) {
                // Revert on failure
                setGigs(prev => prev.map(g => g.id === gig.id ? gig : g));
                alert('Failed to update availability');
            }
        } catch (err) {
            console.error('Error toggling availability:', err);
            setGigs(prev => prev.map(g => g.id === gig.id ? gig : g));
        }
    };

    const filteredGigs = (Array.isArray(gigs) ? gigs : []).filter(gig => {
        const matchesSearch = gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            gig.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' ? true :
            filterStatus === 'ACTIVE' ? gig.isAvailable : !gig.isAvailable;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 min-h-[400px]">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Loading your services...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center text-red-600">
                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Error Loading Services</h3>
                <p>{error}</p>
                <button
                    onClick={fetchGigs}
                    className="mt-4 px-6 py-2 bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors font-medium shadow-sm"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Services</h2>
                    <p className="text-gray-500 mt-1">Manage, edit, and track your offered services</p>
                </div>
                <button
                    onClick={() => {
                        setEditingGig(null);
                        setIsCreateModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200 hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" />
                    Create New Service
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search your services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    {['ALL', 'ACTIVE', 'INACTIVE'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filterStatus === status
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {status === 'ALL' ? 'All Services' : status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {filteredGigs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No services found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6">
                        {searchTerm || filterStatus !== 'ALL'
                            ? "Try adjusting your filters or search terms."
                            : "You haven't created any services yet. Start earning by offering your skills to the community!"}
                    </p>
                    {!searchTerm && filterStatus === 'ALL' && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg"
                        >
                            Create Your First Service
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredGigs.map((gig) => (
                            <motion.div
                                key={gig.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`bg-white rounded-3xl overflow-hidden border transition-all hover:shadow-xl group ${gig.isAvailable ? 'border-gray-100' : 'border-gray-200 opacity-75'
                                    }`}
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={gig.imageUrls?.[0] || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                                        alt={gig.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm border border-white/20 text-white ${gig.isAvailable ? 'bg-green-500/80' : 'bg-gray-500/80'
                                            }`}>
                                            {gig.isAvailable ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>

                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-lg font-bold text-white truncate shadow-black drop-shadow-md">{gig.title}</h3>
                                        <div className="flex items-center text-white/90 text-sm mt-1">
                                            <MapPin className="w-3.5 h-3.5 mr-1" />
                                            <span className="truncate">{gig.destination}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-2xl font-bold text-green-600">
                                            {gig.currency} {gig.price}
                                        </span>
                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg uppercase tracking-wide">
                                            {gig.pricingType}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="truncate">
                                                {gig.availableDays?.map(d => d.charAt(0) + d.slice(1).toLowerCase().substr(0, 2)).join(', ') || 'Flexible'}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="truncate">{gig.availableTimeSlot || 'Flexible hours'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => toggleAvailability(gig)}
                                            className={`p-2 rounded-xl transition-colors ${gig.isAvailable
                                                ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                }`}
                                            title={gig.isAvailable ? "Mark as Inactive" : "Mark as Active"}
                                        >
                                            {gig.isAvailable ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingGig(gig);
                                                    setIsCreateModalOpen(true);
                                                }}
                                                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                                                title="Edit Service"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(gig.id)}
                                                className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                                                title="Delete Service"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <CreateGigForm
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingGig(null);
                }}
                onSuccess={handleCreateSuccess}
                editGig={editingGig}
            />
        </div>
    );
};

export default MyGigs;
