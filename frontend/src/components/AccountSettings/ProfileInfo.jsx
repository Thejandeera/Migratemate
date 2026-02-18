import React, { useState } from 'react';
import { getUserData, setUserData } from '../../utils/auth';
import { updateUserProfile, createNotification } from '../../utils/api';
import { Check, X, Loader2, Camera, User, Mail, Phone, Globe, MapPin, Shield, ShieldCheck, AlertTriangle } from 'lucide-react';
import ProfilePictureUpload from './ProfilePictureUpload';
import { motion } from 'framer-motion';

const ProfileInfo = () => {
    const [user, setUser] = useState(getUserData());
    const [isEditing, setIsEditing] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
            <ProfilePictureUpload
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUpdate={handlePictureUpdate}
            />

            {/* Header Card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
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
                        <button className="absolute bottom-2 right-2 p-2 bg-green-600 text-white rounded-full shadow-lg border-2 border-white hover:bg-green-700 transition-colors transform hover:scale-105">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                    {user.firstName} {user.lastName}
                                </h2>
                                <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2">
                                    <Mail className="w-4 h-4" /> {user.email}
                                </p>
                            </div>

                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex gap-3 justify-center md:justify-start">
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={loading}
                                        className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
                                    >
                                        <X className="w-5 h-5" />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm border border-gray-100">
                                <Globe className="w-4 h-4 text-green-600" />
                                From: <span className="font-semibold text-gray-900">{user.countryOfOrigin || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm border border-gray-100">
                                <MapPin className="w-4 h-4 text-red-500" />
                                Living in: <span className="font-semibold text-gray-900">{user.destinationCountry || 'Unknown'}</span>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${user.isVerified ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                {user.isVerified ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                <span className="font-bold">{user.isVerified ? 'Verified Account' : 'Unverified'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {(error || success) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${error ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}
                    >
                        {error ? <AlertTriangle className="w-5 h-5 flex-shrink-0" /> : <Check className="w-5 h-5 flex-shrink-0" />}
                        <p className="font-medium">{error || success}</p>
                    </motion.div>
                )}
            </div>

            {/* Form Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-400" /> Personal Details
                    </h3>

                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-medium text-gray-900"
                                    />
                                ) : (
                                    <div className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">{user.firstName}</div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-medium text-gray-900"
                                    />
                                ) : (
                                    <div className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">{user.lastName || '-'}</div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <span className="font-medium">{user.email}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 ml-1">Email address cannot be changed for security reasons.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                            {isEditing ? (
                                <div className="relative">
                                    <Phone className="absolute top-3.5 left-4 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+61 ..."
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-medium text-gray-900"
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

                <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-gray-400" /> Migration Info
                    </h3>

                    <div className="space-y-6">
                        <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                            <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Country of Origin</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="countryOfOrigin"
                                    value={formData.countryOfOrigin}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-medium text-gray-900"
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                    <span className="text-2xl">🛫</span> {user.countryOfOrigin || <span className="text-gray-400 font-normal italic">Not set</span>}
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-green-50/50 rounded-2xl border border-green-100">
                            <label className="block text-xs font-bold text-green-800 uppercase tracking-wider mb-2">Destination Country</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="destinationCountry"
                                    value={formData.destinationCountry}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition font-medium text-gray-900"
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                    <span className="text-2xl">🛬</span> {user.destinationCountry || <span className="text-gray-400 font-normal italic">Not set</span>}
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-3">
                            <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Privacy Note</h4>
                                <p className="text-xs text-gray-500 mt-1">Your location info helps us suggest relevant communities and services. It is shared only when necessary.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;
