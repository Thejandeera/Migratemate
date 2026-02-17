import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash, Users, Search, Loader } from "lucide-react";
import Navbar from '../components/Navbar';

// You might need to adjust the API base URL based on your admin config
const API_BASE_URL = "http://localhost:8080/api";

const CommunityManagement = () => {
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        originCountry: "",
        destinationCountry: "",
        description: "",
        coverImageUrl: ""
    });

    useEffect(() => {
        fetchCommunities();
    }, []);

    const fetchCommunities = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem("token"); // Assuming admin token is stored here
            const response = await axios.get(`${API_BASE_URL}/communities`, {
                // headers: { Authorization: `Bearer ${token}` } // Add if admin API requires auth
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

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE_URL}/communities`, formData);
            if (response.data.success) {
                setCommunities([...communities, response.data.data]);
                setShowModal(false);
                setFormData({
                    name: "",
                    originCountry: "",
                    destinationCountry: "",
                    description: "",
                    coverImageUrl: ""
                });
                alert("Community Created Successfully!");
            }
        } catch (error) {
            console.error("Error creating community:", error);
            alert("Failed to create community");
        }
    };

    const filteredCommunities = communities.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.originCountry && c.originCountry.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-24">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Community Management</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage and monitor all communities</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-green-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-green-700 transition shadow-sm font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Create Community
                    </button>
                </div>

                {/* Search and Filters */}
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
                            <div key={community.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                                <div className="h-40 bg-gray-100 relative overflow-hidden">
                                    <img
                                        src={community.coverImageUrl || "https://via.placeholder.com/400x200"}
                                        alt={community.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{community.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md font-medium">{community.originCountry}</span>
                                        <span className="text-gray-300">→</span>
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">{community.destinationCountry}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-5 line-clamp-2 h-10 leading-relaxed">{community.description}</p>

                                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                        <div className="flex items-center text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                                            <Users className="w-3.5 h-3.5 mr-1.5" />
                                            {community.memberCount} members
                                        </div>
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
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Create New Community</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-5">
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
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cover Image URL</label>
                                <input
                                    type="url"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                                    value={formData.coverImageUrl}
                                    onChange={e => setFormData({ ...formData, coverImageUrl: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                />
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
                                    Create Community
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
