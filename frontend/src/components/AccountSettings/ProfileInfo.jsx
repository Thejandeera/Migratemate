import React, { useState } from 'react';
import { getUserData, setUserData } from '../../utils/auth';
import { updateUserProfile, createNotification } from '../../utils/api';
import { Check, X, Loader2, Camera } from 'lucide-react';
import ProfilePictureUpload from './ProfilePictureUpload';

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

    // Update local state when profile picture changes
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
                // Update local storage
                const updatedUser = { ...user, ...apiResponse.data };

                setUserData(updatedUser);
                setUser(updatedUser);
                setSuccess('Profile updated successfully!');

                // Trigger Frontend Notification
                await createNotification(
                    updatedUser.id,
                    'Profile Updated',
                    'Your profile details have been successfully updated.',
                    'GREEN'
                );

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
        <div className="space-y-6">
            <ProfilePictureUpload
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUpdate={handlePictureUpdate}
            />

            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="relative group cursor-pointer" onClick={() => setIsUploadOpen(true)}>
                        <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-md relative">
                            <img
                                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.firstName || 'User'}&background=random&size=128`}
                                alt={user.firstName}
                                className="w-full h-full object-cover transition-opacity group-hover:opacity-75"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-gray-800" />
                            </div>
                        </div>
                        <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full text-gray-600 shadow-md border border-gray-100 hover:text-green-600 transition-colors">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 w-full">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.firstName} {user.lastName}</h2>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        {user.email || 'email@example.com'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        {user.destinationCountry || 'Australia'}
                                    </span>
                                </div>
                            </div>

                            {!isEditing ? (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition shadow-sm"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition shadow-sm flex items-center gap-2 disabled:opacity-70"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        Save
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={loading}
                                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {(error || success) && (
                            <div className={`mt-4 p-3 rounded-lg text-sm ${error ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                {error || success}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">First Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                ) : (
                                    <div className="text-sm font-medium text-gray-900">{user.firstName}</div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Last Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                ) : (
                                    <div className="text-sm font-medium text-gray-900">{user.lastName || '-'}</div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                            <div className="text-sm font-medium text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                {user.email}
                                <span className="ml-2 text-xs text-gray-400 italic">(Cannot be changed)</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+61 ..."
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            ) : (
                                <div className="text-sm font-medium text-gray-900">{user.phone || 'Not provided'}</div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Country of Origin</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="countryOfOrigin"
                                        value={formData.countryOfOrigin}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                ) : (
                                    <div className="text-sm font-medium text-gray-900">{user.countryOfOrigin || 'Not provided'}</div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Destination Country</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="destinationCountry"
                                        value={formData.destinationCountry}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                ) : (
                                    <div className="text-sm font-medium text-gray-900">{user.destinationCountry || 'Not provided'}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                    <div className="space-y-4">
                        {/* Identity Verification Status */}
                        <div className={`flex items-center justify-between p-3 rounded-lg border ${user.isVerified
                                ? 'bg-green-50 border-green-100'
                                : 'bg-yellow-50 border-yellow-100'
                            }`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${user.isVerified ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                    }`}>
                                    {user.isVerified ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    )}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">Identity Verification</div>
                                    <div className={`text-xs ${user.isVerified ? 'text-green-700' : 'text-yellow-700'}`}>
                                        {user.isVerified ? 'Your account is fully verified' : 'Action required: Please complete KYC'}
                                    </div>
                                </div>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded border ${user.isVerified
                                    ? 'text-green-600 bg-white border-green-200'
                                    : 'text-yellow-600 bg-white border-yellow-200'
                                }`}>
                                {user.isVerified ? 'VERIFIED' : 'PENDING'}
                            </span>
                        </div>

                        {/* Uploaded Documents Preview */}
                        <div className="pt-4 border-t border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">KYC Documents</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Passport */}
                                <div className="p-3 border border-gray-100 rounded-lg">
                                    <div className="text-xs text-gray-500 mb-2">Passport/ID</div>
                                    {user.passportImageUrl ? (
                                        <a href={user.passportImageUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video bg-gray-100 rounded overflow-hidden group">
                                            <img src={user.passportImageUrl} alt="Passport" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">View</span>
                                            </div>
                                        </a>
                                    ) : (
                                        <div className="aspect-video bg-gray-50 rounded flex items-center justify-center text-gray-400 text-xs text-center p-2">
                                            Not Uploaded
                                        </div>
                                    )}
                                </div>

                                {/* Selfie */}
                                <div className="p-3 border border-gray-100 rounded-lg">
                                    <div className="text-xs text-gray-500 mb-2">Selfie</div>
                                    {user.selfieImageUrl ? (
                                        <a href={user.selfieImageUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video bg-gray-100 rounded overflow-hidden group">
                                            <img src={user.selfieImageUrl} alt="Selfie" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">View</span>
                                            </div>
                                        </a>
                                    ) : (
                                        <div className="aspect-video bg-gray-50 rounded flex items-center justify-center text-gray-400 text-xs text-center p-2">
                                            Not Uploaded
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-200 rounded-full text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">Two-Factor Auth</div>
                                    <div className="text-xs text-gray-500">Add an extra layer of security</div>
                                </div>
                            </div>
                            <button className="text-xs font-semibold text-green-600 hover:underline">Enable</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;
