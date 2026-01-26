import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import { updateUserProfileMultipart, createNotification } from '../../utils/api';
import { setUserData, getUserData } from '../../utils/auth';

const ProfilePictureUpload = ({ isOpen, onClose, onUpdate }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    if (!isOpen) return null;

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (JPEG, PNG)');
            return;
        }
        // Validate size (e.g., 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size too large (max 5MB)');
            return;
        }

        setError('');
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        if (!selectedFile) return;

        setLoading(true);
        setError('');

        try {
            // Need to construct formData with 'avatar' and potentially empty 'data' json
            // Backend expects: data (json string, optional), avatar, passport, selfie
            const formData = new FormData();
            formData.append('avatar', selectedFile);
            // formData.append('data', '{}'); // Optional, if needed to prevent backend error if it tries to parse null

            const response = await updateUserProfileMultipart(formData);

            if (response.success && response.data) {
                // Update local storage
                const currentUser = getUserData();
                const updatedUser = { ...currentUser, ...response.data };
                setUserData(updatedUser);

                // Trigger Frontend Notification
                await createNotification(
                    updatedUser.id,
                    'Profile Picture Updated',
                    'Your profile picture has been changed successfully.',
                    'GREEN'
                );

                if (onUpdate) onUpdate(updatedUser);
                onClose();
            } else {
                setError(response.message || 'Failed to update profile picture');
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setError('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scaleIn">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Update Profile Picture</h3>
                    <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                            <X className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {!selectedFile ? (
                        <div
                            className={`
                                relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
                                ${dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'}
                            `}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current?.click()}
                        >
                            <input
                                ref={inputRef}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleChange}
                            />

                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <Upload className="w-8 h-8" />
                            </div>
                            <p className="text-gray-900 font-medium mb-1">Click to upload or drag and drop</p>
                            <p className="text-gray-500 text-xs">SVG, PNG, JPG or GIF (max. 5MB)</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-gray-100 shadow-inner mb-6 group">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                        className="text-white text-xs font-semibold hover:underline"
                                    >
                                        Change Image
                                    </button>
                                </div>
                            </div>

                            <div className="w-full flex gap-3">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-1 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Save Update
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePictureUpload;
