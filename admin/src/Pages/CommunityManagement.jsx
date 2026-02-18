import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash, Users, Search, Loader, Edit, MessageSquare, Image as ImageIcon, X } from "lucide-react";
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

// You might need to adjust the API base URL based on your admin config
const API_BASE_URL = import.meta.env.VITE_API_URL;

const CommunityManagement = () => {
    const navigate = useNavigate();
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

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
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this community?")) return;

        try {
            const response = await axios.delete(`${API_BASE_URL}/communities/${id}`);
            if (response.data.success) {
                setCommunities(communities.filter(c => c.id !== id));
            }
        } catch (error) {
            console.error("Error deleting community:", error);
            alert("Failed to delete community");
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
        try {
            if (isEditing) {
                const response = await axios.put(`${API_BASE_URL}/communities/${currentCommunityId}`, formData);
                if (response.data.success) {
                    setCommunities(communities.map(c => c.id === currentCommunityId ? response.data.data : c));
                    alert("Community Updated Successfully!");
                }
            } else {
                const response = await axios.post(`${API_BASE_URL}/communities`, formData);
                if (response.data.success) {
                    setCommunities([...communities, response.data.data]);
                    alert("Community Created Successfully!");
                }
            }
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error("Error saving community:", error);
            alert(`Failed to ${isEditing ? 'update' : 'create'} community`);
        }
    };

    const filteredCommunities = communities.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.originCountry && c.originCountry.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen font-sans text-gray-900">
            <Navbar />

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-24">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Community Management</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage and monitor all communities</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="bg-green-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-green-700 transition shadow-sm font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Create Community
                    </button>
                </div>

                {/* Search */}
                <div className="mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center max-w-md">
                    <Search className="text-gray-400 w-5 h-5 ml-3" />
                    <input
                        type="text"
                        placeholder="Search communities..."
                        className="w-full pl-3 pr-4 py-2 border-0 focus:ring-0 text-gray-700 bg-transparent placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* List */}
                {loading ? (
                    <div className="flex justify-center p-20">
                        <Loader className="w-10 h-10 text-green-600 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCommunities.map(community => (
                            <div key={community.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
                                <div className="h-40 bg-gray-100 relative overflow-hidden group-hover:opacity-90 transition-opacity">
                                    <img
                                        src={community.coverImageUrl || "https://placehold.co/600x400"}
                                        alt={community.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${community.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {community.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{community.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md font-medium truncate max-w-[40%]">{community.originCountry}</span>
                                        <span className="text-gray-300">→</span>
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium truncate max-w-[40%]">{community.destinationCountry}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed flex-1">{community.description}</p>

                                    <div className="flex justify-between items-center pt-4 border-t border-gray-50 mt-auto">
                                        <div className="flex items-center text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                                            <Users className="w-3.5 h-3.5 mr-1.5" />
                                            {community.memberCount}
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => navigate(`/communities/chat/${community.id}`)}
                                                className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition"
                                                title="View Chat"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(community)}
                                                className="text-gray-400 hover:text-yellow-600 p-2 rounded-lg hover:bg-yellow-50 transition"
                                                title="Edit Community"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(community.id)}
                                                className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition"
                                                title="Delete Community"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal (Create/Edit) */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Community' : 'Create New Community'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Community Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Sri Lankans in Australia"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Origin</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                                        value={formData.originCountry}
                                        onChange={e => setFormData({ ...formData, originCountry: e.target.value })}
                                        placeholder="e.g. Sri Lanka"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Destination</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                                        value={formData.destinationCountry}
                                        onChange={e => setFormData({ ...formData, destinationCountry: e.target.value })}
                                        placeholder="e.g. Australia"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                                <textarea
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm min-h-[100px]"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the purpose of this community..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rules (Optional)</label>
                                <textarea
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm min-h-[80px]"
                                    value={formData.rules}
                                    onChange={e => setFormData({ ...formData, rules: e.target.value })}
                                    placeholder="Community rules..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cover Image</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-green-500 transition cursor-pointer relative bg-gray-50">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {previewImage ? (
                                        <div className="relative h-32 w-full">
                                            <img src={previewImage} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white font-medium opacity-0 hover:opacity-100 transition rounded-lg">
                                                Change Image
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-4 text-gray-500 flex flex-col items-center">
                                            <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                                            <span>Click to upload image</span>
                                            <span className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-md hover:shadow-lg transform active:scale-95"
                                >
                                    {isEditing ? 'Update Community' : 'Create Community'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityManagement;
