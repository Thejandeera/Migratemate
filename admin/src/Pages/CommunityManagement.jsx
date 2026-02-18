import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Plus,
    Trash,
    Users,
    Search,
    Loader,
    Edit,
    MessageSquare,
    Image as ImageIcon,
    X,
    MapPin,
    FileText,
    Shield,
    Globe
} from "lucide-react";
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// You might need to adjust the API base URL based on your admin config
const API_BASE_URL = import.meta.env.VITE_API_URL;

const CommunityManagement = () => {
    const navigate = useNavigate();
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [currentCommunityId, setCurrentCommunityId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        originCountry: "",
        destinationCountry: "",
        description: "",
        rules: "",
        coverImageBase64: "" // Changed from URL to Base64 for upload
    });
    const [previewImage, setPreviewImage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCommunities();
    }, []);

    const fetchCommunities = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/communities`, {
                // headers: { Authorization: `Bearer ${token}` } 
            });
            if (response.data.success) {
                setCommunities(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching communities:", error);
            showNotification("Failed to fetch communities", "error");
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this community?")) return;

        try {
            const response = await axios.delete(`${API_BASE_URL}/communities/${id}`);
            if (response.data.success) {
                setCommunities(communities.filter(c => c.id !== id));
                showNotification("Community deleted successfully", "success");
            }
        } catch (error) {
            console.error("Error deleting community:", error);
            showNotification("Failed to delete community", "error");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, coverImageBase64: reader.result });
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            originCountry: "",
            destinationCountry: "",
            description: "",
            rules: "",
            coverImageBase64: ""
        });
        setPreviewImage("");
        setIsEditing(false);
        setCurrentCommunityId(null);
        setSubmitting(false);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (community) => {
        setFormData({
            name: community.name,
            originCountry: community.originCountry,
            destinationCountry: community.destinationCountry,
            description: community.description,
            rules: community.rules || "",
            coverImageBase64: "" // Reset base64, keep URL for preview only if needed
        });
        setPreviewImage(community.coverImageUrl);
        setIsEditing(true);
        setCurrentCommunityId(community.id);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (isEditing) {
                const response = await axios.put(`${API_BASE_URL}/communities/${currentCommunityId}`, formData);
                if (response.data.success) {
                    setCommunities(communities.map(c => c.id === currentCommunityId ? response.data.data : c));
                    showNotification("Community Updated Successfully!", "success");
                }
            } else {
                const response = await axios.post(`${API_BASE_URL}/communities`, formData);
                if (response.data.success) {
                    setCommunities([...communities, response.data.data]);
                    showNotification("Community Created Successfully!", "success");
                }
            }
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error("Error saving community:", error);
            showNotification(`Failed to ${isEditing ? 'update' : 'create'} community`, "error");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredCommunities = communities.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.originCountry && c.originCountry.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Management</h1>
                        <p className="text-gray-500">Create, monitor, and manage community groups.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold shadow-lg shadow-green-200 hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5" />
                        Create Community
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-2 mb-8 sticky top-24 z-30">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search communities by name or country..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-0 focus:bg-gray-100 transition-all text-gray-900 placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading communities...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {filteredCommunities.map((community, index) => (
                                <motion.div
                                    key={community.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full hover:-translate-y-1"
                                >
                                    <div className="h-48 bg-gray-100 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
                                        <img
                                            src={community.coverImageUrl || "https://placehold.co/600x400"}
                                            alt={community.name}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-3 right-3 z-20 flex gap-2">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-md border border-white/20 ${community.isActive ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                                                {community.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20">
                                            <h3 className="font-bold text-lg text-white mb-1 truncate">{community.name}</h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-200">
                                                <div className="flex items-center gap-1">
                                                    <Globe size={12} />
                                                    <span className="truncate max-w-[80px]">{community.originCountry}</span>
                                                </div>
                                                <span className="opacity-50">→</span>
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={12} />
                                                    <span className="truncate max-w-[80px]">{community.destinationCountry}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                                                <Users size={12} />
                                                {community.memberCount} Members
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-6 line-clamp-3 leading-relaxed flex-1">
                                            {community.description}
                                        </p>

                                        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-50 mt-auto">
                                            <button
                                                onClick={() => navigate(`/communities/chat/${community.id}`)}
                                                className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors group/btn"
                                            >
                                                <MessageSquare className="w-5 h-5 mb-1 group-hover/btn:scale-110 transition-transform" />
                                                <span className="text-[10px] font-bold">Chat</span>
                                            </button>
                                            <button
                                                onClick={() => openEditModal(community)}
                                                className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 transition-colors group/btn"
                                            >
                                                <Edit className="w-5 h-5 mb-1 group-hover/btn:scale-110 transition-transform" />
                                                <span className="text-[10px] font-bold">Edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(community.id)}
                                                className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors group/btn"
                                            >
                                                <Trash className="w-5 h-5 mb-1 group-hover/btn:scale-110 transition-transform" />
                                                <span className="text-[10px] font-bold">Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Modal (Create/Edit) */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[300] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Community' : 'Create New Community'}</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6 flex-1">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Community Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-medium text-gray-900 placeholder-gray-400"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Sri Lankans in Australia"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Origin</label>
                                            <div className="relative">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-medium text-gray-900 placeholder-gray-400"
                                                    value={formData.originCountry}
                                                    onChange={e => setFormData({ ...formData, originCountry: e.target.value })}
                                                    placeholder="e.g. Sri Lanka"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Destination</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-medium text-gray-900 placeholder-gray-400"
                                                    value={formData.destinationCountry}
                                                    onChange={e => setFormData({ ...formData, destinationCountry: e.target.value })}
                                                    placeholder="e.g. Australia"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                        <textarea
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-medium text-gray-900 placeholder-gray-400 min-h-[100px]"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Describe the purpose of this community..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <Shield size={16} className="text-gray-400" />
                                            Rules (Optional)
                                        </label>
                                        <textarea
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-medium text-gray-900 placeholder-gray-400 min-h-[80px]"
                                            value={formData.rules}
                                            onChange={e => setFormData({ ...formData, rules: e.target.value })}
                                            placeholder="Community rules..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-green-500 hover:bg-green-50/50 transition cursor-pointer relative bg-gray-50 group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            {previewImage ? (
                                                <div className="relative h-40 w-full">
                                                    <img src={previewImage} alt="Preview" className="h-full w-full object-cover rounded-xl shadow-md" />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold opacity-0 group-hover:opacity-100 transition rounded-xl backdrop-blur-sm">
                                                        Click to Change Image
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-2 text-gray-500 flex flex-col items-center">
                                                    <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                                                        <ImageIcon className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                    <span className="font-bold text-gray-700">Click to upload cover</span>
                                                    <span className="text-xs text-gray-400 mt-1 font-medium">JPG, PNG up to 5MB</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 hover:shadow-green-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {submitting ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                isEditing ? 'Update Community' : 'Create Community'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CommunityManagement;
