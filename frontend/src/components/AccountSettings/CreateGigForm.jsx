import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Upload, Image, Check, Loader2 } from 'lucide-react';
import TimeInput from './TimeInput';

// Category options
const CATEGORIES = [
    { value: 'TRANSPORT', label: 'Transport' },
    { value: 'HOUSING', label: 'Housing' },
    { value: 'DOCUMENTATION', label: 'Documentation' },
    { value: 'CULTURAL_SUPPORT', label: 'Cultural Support' }
];

// Currency options
const CURRENCIES = [
    { value: 'AUD', label: 'AUD' },
    { value: 'USD', label: 'USD' },
    { value: 'LKR', label: 'LKR' }
];

// Pricing type options
const PRICING_TYPES = [
    { value: 'FIXED', label: 'Fixed Price' },
    { value: 'HOURLY', label: 'Hourly Rate' },
    { value: 'NEGOTIABLE', label: 'Negotiable' }
];

// Duration type options
const DURATION_TYPES = [
    { value: 'MINUTES', label: 'Minutes' },
    { value: 'HOURS', label: 'Hours' },
    { value: 'DAYS', label: 'Days' }
];

// Days of the week
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CreateGigForm = ({ isOpen, onClose, onSuccess, editGig = null }) => {
    const isEditMode = !!editGig;
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        // Step 1
        title: '',
        description: '',
        category: '',
        origin: '',
        destination: '',
        specificLocation: '',
        // Step 2
        price: '',
        currency: 'AUD',
        pricingType: 'FIXED',
        features: '',
        maxCapacity: '',
        duration: '',
        durationType: 'HOURS',
        availableDays: [],
        availableTimeSlot: '',
        // Step 3
        images: []
    });

    // Image previews (for new images uploaded)
    const [imagePreviews, setImagePreviews] = useState([]);
    // Existing image URLs from editGig (for edit mode)
    const [existingImageUrls, setExistingImageUrls] = useState([]);
    // URLs of existing images to be removed (for edit mode)
    const [removedImageUrls, setRemovedImageUrls] = useState([]);

    // Pre-fill form data when editing
    React.useEffect(() => {
        if (editGig && isOpen) {
            setFormData({
                title: editGig.title || '',
                description: editGig.description || '',
                category: editGig.category || '',
                origin: editGig.origin || '',
                destination: editGig.destination || '',
                specificLocation: editGig.specificLocation || '',
                price: editGig.price?.toString() || '',
                currency: editGig.currency || 'AUD',
                pricingType: editGig.pricingType || 'FIXED',
                features: editGig.features?.join(', ') || '',
                maxCapacity: editGig.maxCapacity?.toString() || '',
                duration: editGig.duration?.toString() || '',
                durationType: editGig.durationType || 'HOURS',
                availableDays: editGig.availableDays?.map(d => d.charAt(0) + d.slice(1).toLowerCase()) || [],
                availableTimeSlot: editGig.availableTimeSlot || '',
                images: []
            });
            // Set existing image URLs separately
            if (editGig.imageUrls?.length > 0) {
                setExistingImageUrls(editGig.imageUrls);
            } else {
                setExistingImageUrls([]);
            }
            setImagePreviews([]);
            setRemovedImageUrls([]);
            setCurrentStep(1);
            setError(null);
        } else if (!isOpen) {
            // Reset form when closing
            setFormData({
                title: '',
                description: '',
                category: '',
                origin: '',
                destination: '',
                specificLocation: '',
                price: '',
                currency: 'AUD',
                pricingType: 'FIXED',
                features: '',
                maxCapacity: '',
                duration: '',
                durationType: 'HOURS',
                availableDays: [],
                availableTimeSlot: '',
                images: []
            });
            setImagePreviews([]);
            setExistingImageUrls([]);
            setRemovedImageUrls([]);
            setCurrentStep(1);
            setError(null);
        }
    }, [editGig, isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDayToggle = (day) => {
        setFormData(prev => ({
            ...prev,
            availableDays: prev.availableDays.includes(day)
                ? prev.availableDays.filter(d => d !== day)
                : [...prev.availableDays, day]
        }));
    };

    const handleImageDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer?.files || e.target.files || []);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length + formData.images.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }

        const newImages = [...formData.images, ...imageFiles];
        setFormData(prev => ({ ...prev, images: newImages }));

        // Create previews
        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Remove existing image (for edit mode)
    const removeExistingImage = (index) => {
        const urlToRemove = existingImageUrls[index];
        setRemovedImageUrls(prev => [...prev, urlToRemove]);
        setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const nextStep = () => {
        setError(null);
        if (currentStep === 1) {
            if (!formData.title || !formData.category || !formData.destination) {
                setError('Please fill in all required fields');
                return;
            }
        }
        if (currentStep === 2) {
            if (!formData.price || !formData.pricingType) {
                setError('Please fill in price and pricing type');
                return;
            }
        }
        setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        setError(null);
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Get auth token
            let token = null;
            try {
                const authData = JSON.parse(sessionStorage.getItem('migratemate_auth') || localStorage.getItem('migratemate_auth'));
                token = authData?.token;
            } catch (e) {
                console.error("Error parsing auth data", e);
            }

            if (!token) {
                throw new Error('Not authenticated');
            }

            // Convert images to base64
            const base64Images = await Promise.all(
                formData.images.map(file => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                })
            );

            // Prepare request body - different image field names for create vs update
            const requestBody = {
                title: formData.title,
                description: formData.description || formData.title,
                category: formData.category,
                origin: formData.origin || null,
                destination: formData.destination,
                specificLocation: formData.specificLocation || null,
                price: parseFloat(formData.price),
                currency: formData.currency,
                pricingType: formData.pricingType,
                features: formData.features ? formData.features.split(',').map(f => f.trim()) : [],
                maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : null,
                duration: formData.duration ? parseInt(formData.duration) : null,
                durationType: formData.durationType,
                availableDays: formData.availableDays.map(day => day.toUpperCase()),
                availableTimeSlot: formData.availableTimeSlot || null
            };

            // Add images with correct field name based on mode
            if (base64Images.length > 0) {
                if (isEditMode) {
                    // For updates, use newImagesBase64
                    requestBody.newImagesBase64 = base64Images;
                } else {
                    // For creates, use imagesBase64
                    requestBody.imagesBase64 = base64Images;
                }
            }

            // For updates, include images to remove
            if (isEditMode && removedImageUrls.length > 0) {
                requestBody.removeImageUrls = removedImageUrls;
            }

            const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
            const url = isEditMode
                ? `${API_URL}/services/${editGig.id}`
                : `${API_URL}/services`;
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || `Failed to ${isEditMode ? 'update' : 'create'} service`);
            }

            // Success
            onSuccess && onSuccess(data.data, isEditMode);
            onClose();
        } catch (err) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} service:`, err);
            setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} service`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const steps = [
        { number: 1, title: 'Basic Info' },
        { number: 2, title: 'Pricing & Details' },
        { number: 3, title: 'Images' }
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">{isEditMode ? 'Update Gig' : 'Create New Gig'}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Step Indicators */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${currentStep > step.number
                                    ? 'bg-green-500 text-white'
                                    : currentStep === step.number
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {currentStep > step.number ? <Check className="w-4 h-4" /> : step.number}
                                </div>
                                <span className={`ml-2 text-sm font-medium ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                                    }`}>
                                    {step.title}
                                </span>
                                {index < steps.length - 1 && (
                                    <div className={`w-12 h-0.5 mx-4 ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Airport Pickup Service"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe your service..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-white"
                                >
                                    <option value="">Select a category</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Origin
                                    </label>
                                    <input
                                        type="text"
                                        name="origin"
                                        value={formData.origin}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Sri Lanka"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Destination <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="destination"
                                        value={formData.destination}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Melbourne"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Specific Location
                                </label>
                                <input
                                    type="text"
                                    name="specificLocation"
                                    value={formData.specificLocation}
                                    onChange={handleInputChange}
                                    placeholder="e.g., CBD, Carlton, etc."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Pricing & Details */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Price <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        min="0"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Currency
                                    </label>
                                    <select
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-white"
                                    >
                                        {CURRENCIES.map(cur => (
                                            <option key={cur.value} value={cur.value}>{cur.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pricing Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="pricingType"
                                        value={formData.pricingType}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-white"
                                    >
                                        {PRICING_TYPES.map(pt => (
                                            <option key={pt.value} value={pt.value}>{pt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Features (comma separated)
                                </label>
                                <input
                                    type="text"
                                    name="features"
                                    value={formData.features}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Air conditioning, WiFi, Luggage space"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Max Capacity
                                    </label>
                                    <input
                                        type="number"
                                        name="maxCapacity"
                                        value={formData.maxCapacity}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 4"
                                        min="1"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration
                                    </label>
                                    <input
                                        type="number"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 2"
                                        min="1"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration Type
                                    </label>
                                    <select
                                        name="durationType"
                                        value={formData.durationType}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-white"
                                    >
                                        {DURATION_TYPES.map(dt => (
                                            <option key={dt.value} value={dt.value}>{dt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Available Days
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS_OF_WEEK.map(day => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => handleDayToggle(day)}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${formData.availableDays.includes(day)
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {day.slice(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Available Time Slot
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-xl border border-gray-200">
                                    <TimeInput
                                        label="Start Time"
                                        value={formData.availableTimeSlot ? formData.availableTimeSlot.split(' - ')[0] : '09:00 AM'}
                                        onChange={(newTime) => {
                                            const endTime = formData.availableTimeSlot ? formData.availableTimeSlot.split(' - ')[1] : '05:00 PM';
                                            setFormData(prev => ({ ...prev, availableTimeSlot: `${newTime} - ${endTime}` }));
                                        }}
                                    />
                                    <div className="hidden md:flex items-center justify-center pt-6">
                                        <span className="text-gray-400 font-medium">to</span>
                                    </div>
                                    <TimeInput
                                        label="End Time"
                                        value={formData.availableTimeSlot ? formData.availableTimeSlot.split(' - ')[1] : '05:00 PM'}
                                        onChange={(newTime) => {
                                            const startTime = formData.availableTimeSlot ? formData.availableTimeSlot.split(' - ')[0] : '09:00 AM';
                                            setFormData(prev => ({ ...prev, availableTimeSlot: `${startTime} - ${newTime}` }));
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Selected: <span className="font-medium text-green-600">{formData.availableTimeSlot || '09:00 AM - 05:00 PM'}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Images */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Images (Max 5)
                                </label>
                                <div
                                    onDrop={handleImageDrop}
                                    onDragOver={handleDragOver}
                                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-green-400 transition-colors cursor-pointer bg-gray-50"
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageDrop}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label htmlFor="image-upload" className="cursor-pointer">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Upload className="w-8 h-8 text-green-600" />
                                        </div>
                                        <p className="text-gray-700 font-medium mb-1">
                                            Drag & drop images here
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            or <span className="text-green-600 font-medium">browse</span> to upload
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            PNG, JPG up to 5MB each
                                        </p>
                                    </label>
                                </div>
                            </div>

                            {/* Existing Images (Edit Mode) */}
                            {isEditMode && existingImageUrls.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Current Images</p>
                                    <div className="grid grid-cols-5 gap-3">
                                        {existingImageUrls.map((url, index) => (
                                            <div key={`existing-${index}`} className="relative group">
                                                <img
                                                    src={url}
                                                    alt={`Existing ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(index)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">New Images</p>
                                    <div className="grid grid-cols-5 gap-3">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={`new-${index}`} className="relative group">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg border border-green-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={currentStep === 1 ? onClose : prevStep}
                        className="px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        {currentStep === 1 ? 'Cancel' : 'Back'}
                    </button>

                    {currentStep < 3 ? (
                        <button
                            onClick={nextStep}
                            className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {isEditMode ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    {isEditMode ? 'Update Gig' : 'Create Gig'}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateGigForm;
