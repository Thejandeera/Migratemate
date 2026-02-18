import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getAuthData } from '../utils/auth';
import { ArrowLeft, Save, X, User, Mail, Phone, MapPin, Globe, FileText, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EditUserPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Initialize with empty strings
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
        countryOfOrigin: '',
        destinationCountry: ''
    });

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
                    headers: { 'Authorization': `Bearer ${getAuthData()?.token}` }
                });

                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    const user = data.data;
                    setFormData({
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        location: user.location || '',
                        bio: user.bio || '',
                        countryOfOrigin: user.countryOfOrigin || '',
                        destinationCountry: user.destinationCountry || ''
                    });
                } else {
                    setError(data.message);
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Failed to fetch user details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUser();
        } else {
            setError("No user ID provided");
            setLoading(false);
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}/admin-update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthData()?.token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                showNotification('User updated successfully', 'success');
                setTimeout(() => navigate(`/users/${id}`), 1000);
            } else {
                setError(data.message || 'Update failed');
                showNotification(data.message || 'Update failed', 'error');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to update user');
            showNotification('Failed to update user', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col font-sans">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col font-sans">
            <Navbar />
            <div className="flex-1 flex items-center justify-center text-red-600 font-medium">
                {error}
            </div>
        </div>
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

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="group flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-2"
                        >
                            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-medium">Back to Profile</span>
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Edit User Profile</h1>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
                >
                    <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                            {/* Personal Info */}
                            <div className="md:col-span-2">
                                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
                                    <User className="text-blue-500" size={20} />
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            id="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-gray-900 placeholder-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            id="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-gray-900 placeholder-gray-400"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label htmlFor="bio" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <FileText size={16} className="text-gray-400" /> Bio
                                        </label>
                                        <textarea
                                            name="bio"
                                            id="bio"
                                            rows="3"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-gray-900 placeholder-gray-400 resize-none"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Contact & Location */}
                            <div className="md:col-span-2">
                                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6 flex items-center gap-2 pt-2">
                                    <Briefcase className="text-indigo-500" size={20} />
                                    Contact & Location
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <Mail size={16} className="text-gray-400" /> Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-gray-900 placeholder-gray-400"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <Phone size={16} className="text-gray-400" /> Phone
                                        </label>
                                        <input
                                            type="text"
                                            name="phone"
                                            id="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-gray-900 placeholder-gray-400"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="location" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <MapPin size={16} className="text-gray-400" /> Current Location
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            id="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-gray-900 placeholder-gray-400"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="countryOfOrigin" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <Globe size={16} className="text-gray-400" /> Origin
                                        </label>
                                        <input
                                            type="text"
                                            name="countryOfOrigin"
                                            id="countryOfOrigin"
                                            value={formData.countryOfOrigin}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-gray-900 placeholder-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="destinationCountry" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <Globe size={16} className="text-gray-400" /> Destination
                                        </label>
                                        <input
                                            type="text"
                                            name="destinationCountry"
                                            id="destinationCountry"
                                            value={formData.destinationCountry}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-gray-900 placeholder-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white z-10">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-bold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {saving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} /> Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default EditUserPage;
