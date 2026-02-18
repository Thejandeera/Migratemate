import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getAuthData } from '../utils/auth';
import { ArrowLeft, Mail, Phone, MapPin, Globe, CheckCircle, XCircle, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


const ImageModal = ({ src, alt, onClose }) => {
    if (!src) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={src}
                    alt={alt}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                >
                    <XCircle size={32} />
                </button>
            </motion.div>
        </motion.div>
    );
};

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [verifying, setVerifying] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [selectedImage, setSelectedImage] = useState(null);

    const openImage = (url) => {
        if (url) setSelectedImage(url);
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const handleUserUpdated = (updatedUser) => {
        setUser({ ...user, ...updatedUser });
        showNotification('User profile updated successfully', 'success');
    };

    const handleToggleVerification = async () => {
        if (verifying) return;
        setVerifying(true);
        try {
            const newStatus = !user.isVerified;
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}/verify?isVerified=${newStatus}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${getAuthData()?.token}` }
            });

            const data = await response.json();
            if (data.success) {
                setUser({ ...user, isVerified: newStatus });
                showNotification(`User ${newStatus ? 'verified' : 'unverified'} successfully`, 'success');
            } else {
                showNotification(data.message || 'Action failed', 'error');
            }
        } catch (err) {
            showNotification('Failed to update verification status', 'error');
        } finally {
            setVerifying(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        setDeleting(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getAuthData()?.token}` }
            });
            const data = await response.json();
            if (data.success) {
                navigate('/users');
            } else {
                showNotification(data.message || 'Delete failed', 'error');
            }
        } catch (err) {
            showNotification('Failed to delete user', 'error');
        } finally {
            setDeleting(false);
        }
    };

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
                    setUser(data.data);
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

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
    if (!user) return <div className="min-h-screen flex items-center justify-center">User not found</div>;

    return (
        <div className="min-h-screen font-sans text-gray-900">
            <Navbar />

            {/* Notification */}
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className={`fixed top-24 right-4 z-[200] max-w-sm w-full p-4 rounded-xl shadow-2xl backdrop-blur-md border border-white/20 ${notification.type === 'success'
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

            <AnimatePresence>
                {selectedImage && (
                    <ImageModal
                        src={selectedImage}
                        alt="Enlarged view"
                        onClose={() => setSelectedImage(null)}
                    />
                )}
            </AnimatePresence>



            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Sticky Wrapper */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-6 sticky top-24">
                        {/* Back Button */}
                        <button
                            onClick={() => navigate(-1)}
                            className="group flex items-center text-gray-500 hover:text-blue-600 transition-colors duration-200 w-full"
                        >
                            <div className="p-2 rounded-full bg-white shadow-sm group-hover:shadow-md mr-3 transition-all">
                                <ArrowLeft size={20} />
                            </div>
                            <span className="font-medium">Back to Users</span>
                        </button>

                        {/* Profile Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
                        >
                            <div className="h-32 bg-gradient-to-br from-indigo-600 to-blue-500 relative">
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20`}>
                                        {user.isHelper ? 'Helper' : 'Standard User'}
                                    </span>
                                </div>
                            </div>
                            <div className="px-6 pb-8 text-center relative">
                                <div className="relative -mt-16 inline-block mb-4 group cursor-pointer" onClick={() => openImage(user.avatarUrl)}>
                                    <img
                                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`}
                                        alt=""
                                        className="w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover bg-white"
                                    />
                                    <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <ZoomIn className="text-white" size={24} />
                                    </div>
                                    {user.isVerified && (
                                        <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md" title="Verified User">
                                            <CheckCircle className="text-blue-500" size={20} fill="currentColor" />
                                        </div>
                                    )}
                                </div>

                                <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.fullName}</h1>
                                <p className="text-sm text-gray-500 font-medium mb-6">{user.email}</p>

                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={() => navigate(`/users/${user.id}/edit`)}
                                        className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold shadow-lg hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Admin Actions Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6"
                        >
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Admin Actions</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={handleToggleVerification}
                                    disabled={verifying}
                                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center ${user.isVerified
                                        ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200'
                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                                        }`}
                                >
                                    {verifying ? (
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    ) : user.isVerified ? (
                                        <><XCircle size={18} className="mr-2" /> Revoke Verification</>
                                    ) : (
                                        <><CheckCircle size={18} className="mr-2" /> Verify User</>
                                    )}
                                </button>

                                <button
                                    onClick={handleDeleteUser}
                                    disabled={deleting}
                                    className="w-full py-3 bg-white text-red-500 border border-red-100 hover:bg-red-50 hover:border-red-200 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center shadow-sm"
                                >
                                    {deleting ? 'Deleting...' : 'Delete Account'}
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8"
                            >
                                <div className="flex items-center mb-6">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl mr-4">
                                        <Globe size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Personal Details</h2>
                                        <p className="text-sm text-gray-500">Location and origin info</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="group p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">From</p>
                                        <p className="text-lg font-medium text-gray-900">{user.countryOfOrigin || 'Not specified'}</p>
                                    </div>
                                    <div className="group p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Destination</p>
                                        <p className="text-lg font-medium text-gray-900">{user.destinationCountry || 'Not specified'}</p>
                                    </div>
                                    <div className="group p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Current Location</p>
                                        <p className="text-lg font-medium text-gray-900">{user.location || 'Not specified'}</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8"
                            >
                                <div className="flex items-center mb-6">
                                    <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl mr-4">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Contact Info</h2>
                                        <p className="text-sm text-gray-500">Reach out to the user</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="group p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Email Address</p>
                                        <p className="text-lg font-medium text-gray-900 break-all">{user.email}</p>
                                    </div>
                                    <div className="group p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Phone Number</p>
                                        <p className="text-lg font-medium text-gray-900">{user.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Bio Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8"
                        >
                            <div className="flex items-center mb-6">
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl mr-4">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">About Me</h2>
                                    <p className="text-sm text-gray-500">User biography</p>
                                </div>
                            </div>
                            <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                                    {user.bio || "This user hasn't written a bio yet."}
                                </p>
                            </div>
                        </motion.div>

                        {/* Documents Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                Verified Documents
                                <span className="ml-3 px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold uppercase rounded-full tracking-wide">Secure</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Passport Card */}
                                <div className="group relative bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                                    <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                                        {user.passportImageUrl ? (
                                            <>
                                                <img
                                                    src={user.passportImageUrl}
                                                    alt="Passport"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div
                                                    className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer backdrop-blur-sm"
                                                    onClick={() => openImage(user.passportImageUrl)}
                                                >
                                                    <div className="bg-white/20 p-3 rounded-full backdrop-blur-md border border-white/30 text-white">
                                                        <ZoomIn size={32} />
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                                <div className="p-4 bg-gray-100 rounded-full mb-3">
                                                    <span className="text-3xl">📄</span>
                                                </div>
                                                <span className="text-sm font-medium">No Document Uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 border-t border-gray-200 bg-white">
                                        <p className="font-bold text-gray-900">Passport / ID</p>
                                        <p className="text-xs text-gray-500 mt-1">Proof of identity</p>
                                    </div>
                                </div>

                                {/* Selfie Card */}
                                <div className="group relative bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                                    <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                                        {user.selfieImageUrl ? (
                                            <>
                                                <img
                                                    src={user.selfieImageUrl}
                                                    alt="Selfie"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div
                                                    className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer backdrop-blur-sm"
                                                    onClick={() => openImage(user.selfieImageUrl)}
                                                >
                                                    <div className="bg-white/20 p-3 rounded-full backdrop-blur-md border border-white/30 text-white">
                                                        <ZoomIn size={32} />
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                                <div className="p-4 bg-gray-100 rounded-full mb-3">
                                                    <span className="text-3xl">🤳</span>
                                                </div>
                                                <span className="text-sm font-medium">No Selfie Uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 border-t border-gray-200 bg-white">
                                        <p className="font-bold text-gray-900">Live Selfie</p>
                                        <p className="text-xs text-gray-500 mt-1">Verification photo</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetails;
