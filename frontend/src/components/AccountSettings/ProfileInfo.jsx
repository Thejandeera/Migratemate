import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getUserData, setUserData } from '../../utils/auth';
import { updateUserProfile, createNotification } from '../../utils/api';
import { Check, X, Loader2, Camera, User, Mail, Phone, Globe, MapPin, Shield, ShieldCheck, AlertTriangle, Edit2 } from 'lucide-react';
import ProfilePictureUpload from './ProfilePictureUpload';
import { motion } from 'framer-motion';

const ProfileInfo = () => {
    const [user, setUser] = useState(getUserData());
    const [isEditing, setIsEditing] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [portalContainer, setPortalContainer] = useState(null);

    useEffect(() => {
        setPortalContainer(document.getElementById('profile-header-actions'));
    }, []);

    const [formData, setFormData] = useState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        countryOfOrigin: user.countryOfOrigin || '',
        destinationCountry: user.destinationCountry || ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePictureUpdate = (updatedUser) => {
        setUser(updatedUser);
        setSuccess('Profile picture updated successfully!');
        window.location.reload();
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const apiResponse = await updateUserProfile(formData);

            if (apiResponse.success && apiResponse.data) {
                const updatedUser = { ...user, ...apiResponse.data };
                setUserData(updatedUser);
                setUser(updatedUser);
                setSuccess('Profile updated successfully!');
                await createNotification(updatedUser.id, 'Profile Updated', 'Your profile details have been successfully updated.', 'GREEN');
                setIsEditing(false);
                window.location.reload();
            } else {
                setError(apiResponse.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'An error occurred while saving.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            countryOfOrigin: user.countryOfOrigin || '',
            destinationCountry: user.destinationCountry || ''
        });
        setIsEditing(false);
        setError('');
        setSuccess('');
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {portalContainer && createPortal(
                <div className="flex items-center gap-3 animate-fade-in">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-neural-dark hover:bg-gray-50 transition-all shadow-sm hover:shadow-md group"
                            title="Edit Profile"
                        >
                            <Edit2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="hidden md:flex px-6 py-2.5 bg-white border border-gray-200 text-gray-600 font-medium rounded-full hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm hover:shadow-md items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                <span>Cancel</span>
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-6 py-2.5 bg-neural-dark text-white font-medium rounded-full hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                                <span>Save Changes</span>
                            </button>
                            {/* Mobile Cancel Button (Icon Only) */}
                            <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="md:hidden w-10 h-10 bg-white border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 flex items-center justify-center shadow-sm"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>,
                portalContainer
            )}

            <ProfilePictureUpload
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUpdate={handlePictureUpdate}
            />

            {/* Header Card */}
            <div className="glass-card rounded-[2rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#1a3a1d]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                    {/* ... (Avatar Section) ... */}
                    <div className="relative group cursor-pointer" onClick={() => setIsUploadOpen(true)}>
                        <div className="w-32 h-32 rounded-full bg-gray-100 p-1 border-4 border-white shadow-xl overflow-hidden relative">
                            <img
                                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.firstName || 'User'}&background=random&size=256`}
                                alt={user.firstName}
                                className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <button className="absolute bottom-2 right-2 p-2 bg-[#1a3a1d] text-white rounded-full shadow-lg border-2 border-white hover:bg-black transition-colors transform hover:scale-105">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2 w-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-4xl font-light text-neural-dark tracking-tight mb-1">
                                    {user.firstName} {user.lastName}
                                </h2>
                                <p className="text-gray-500 font-light flex items-center justify-center md:justify-start gap-2">
                                    <Mail className="w-4 h-4" /> {user.email}
                                </p>
                            </div>
                        </div>
                        


                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2">
                            <div className="flex items-center gap-2 text-gray-500 font-light">
                                <Globe className="w-4 h-4" />
                                <span>From <span className="text-neural-dark font-medium">{user.countryOfOrigin || 'Unknown'}</span></span>
                            </div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full hidden md:block" />
                            <div className="flex items-center gap-2 text-gray-500 font-light">
                                <MapPin className="w-4 h-4" />
                                <span>Living in <span className="text-neural-dark font-medium">{user.destinationCountry || 'Unknown'}</span></span>
                            </div>
                            {!user.isVerified && (
                                <>
                                    <div className="w-1 h-1 bg-gray-300 rounded-full hidden md:block" />
                                    <div className="flex items-center gap-2 text-yellow-600/80 font-medium text-sm bg-yellow-50/50 px-3 py-1 rounded-full border border-yellow-100/50">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        <span>Unverified</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {(error || success) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${error ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-[#1a3a1d]/5 text-[#1a3a1d] border border-[#1a3a1d]/10'}`}
                    >
                        {error ? <AlertTriangle className="w-5 h-5 flex-shrink-0" /> : <Check className="w-5 h-5 flex-shrink-0" />}
                        <p className="font-medium">{error || success}</p>
                    </motion.div>
                )}
            </div>

            {/* Form Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card rounded-[2rem] p-8">
                    <h3 className="text-2xl font-light text-neural-dark mb-6 flex items-center gap-2 tracking-tight">
                        <User className="w-5 h-5 text-gray-400" /> Personal Details
                    </h3>

                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">First Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3a1d]/20 focus:border-[#1a3a1d]/30 outline-none transition font-medium text-gray-900"
                                    />
                                ) : (
                                    <div className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">{user.firstName}</div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3a1d]/20 focus:border-[#1a3a1d]/30 outline-none transition font-medium text-gray-900"
                                    />
                                ) : (
                                    <div className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">{user.lastName || '-'}</div>
                                )}
                            </div>
                        </div>

                        <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-gray-500 cursor-not-allowed">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <span className="font-medium">{user.email}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 ml-1">Email address cannot be changed for security reasons.</p>
                        </div>

                        <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                                {isEditing ? (
                                <div className="relative">
                                    <Phone className="absolute top-3.5 left-4 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+61 ..."
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3a1d]/20 focus:border-[#1a3a1d]/30 outline-none transition font-medium text-gray-900"
                                    />
                                </div>
                            ) : (
                                <div className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                    {user.phone || <span className="text-gray-400 italic">Not provided</span>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-[2rem] p-8">
                    <h3 className="text-2xl font-light text-neural-dark mb-6 flex items-center gap-2 tracking-tight">
                        <Globe className="w-5 h-5 text-gray-400" /> Migration Info
                    </h3>

                    <div className="space-y-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Origin & Destination</label>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-neural-dark transition-colors">
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">From</p>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="countryOfOrigin"
                                                        value={formData.countryOfOrigin}
                                                        onChange={handleChange}
                                                        className="mt-1 bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-gray-400 px-0 py-1 text-neural-dark font-light w-full"
                                                        placeholder="Enter origin"
                                                    />
                                                ) : (
                                                    <p className="text-lg text-neural-dark font-light">{user.countryOfOrigin || 'Not set'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-neural-dark transition-colors">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Living In</p>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="destinationCountry"
                                                        value={formData.destinationCountry}
                                                        onChange={handleChange}
                                                        className="mt-1 bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-gray-400 px-0 py-1 text-neural-dark font-light w-full"
                                                        placeholder="Enter destination"
                                                    />
                                                ) : (
                                                    <p className="text-lg text-neural-dark font-light">{user.destinationCountry || 'Not set'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                             <p className="text-xs text-gray-400 font-light leading-relaxed">
                                <span className="font-medium text-gray-500">Privacy Note:</span> Your location info helps us suggest relevant communities and services. It is shared only when necessary.
                            </p>
                        </div>
                    </div>
                    </div>
                </div>
        </div>
    );
};

export default ProfileInfo;
