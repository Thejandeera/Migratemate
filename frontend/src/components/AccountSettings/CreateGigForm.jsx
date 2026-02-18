import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Upload, Image, Check, Loader2, MapPin, DollarSign, Clock, Calendar, Type } from 'lucide-react';
import TimeInput from './TimeInput';
import { motion, AnimatePresence } from 'framer-motion';

// Category options
const CATEGORIES = [
    { value: 'TRANSPORT', label: 'Transport' },
    { value: 'HOUSING', label: 'Housing' },
    { value: 'DOCUMENTATION', label: 'Documentation' },
    { value: 'CULTURAL_SUPPORT', label: 'Cultural Support' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'OTHER', label: 'Other' }
];

// Currency options
const CURRENCIES = [
    { value: 'AUD', label: 'AUD' },
    { value: 'USD', label: 'USD' },
    { value: 'LKR', label: 'LKR' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' }
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
        { number: 1, title: 'Details' },
        { number: 2, title: 'Pricing' },
        { number: 3, title: 'Media' }
    ];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 bg-backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900">{isEditMode ? 'Update Service' : 'Create New Service'}</h2>
                            <p className="text-xs text-gray-500">Step {currentStep} of 3</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Step Indicators */}
                    <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
                        <div className="flex items-center justify-between max-w-md mx-auto">
                            {steps.map((step, index) => (
                                <div key={step.number} className="flex items-center">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${currentStep > step.number
                                        ? 'bg-green-500 text-white'
                                        : currentStep === step.number
                                            ? 'bg-green-600 text-white shadow-lg shadow-green-200 ring-2 ring-green-100'
                                            : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {currentStep > step.number ? <Check className="w-4 h-4" /> : step.number}
                                    </div>
                                    <span className={`ml-3 text-sm font-bold hidden sm:block ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {step.title}
                                    </span>
                                    {index < steps.length - 1 && (
                                        <div className={`w-12 h-0.5 mx-4 ${currentStep > step.number ? 'bg-green-300' : 'bg-gray-200'}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2"
                            >
                                <X className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        {/* Step 1: Basic Info */}
                        {currentStep === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Service Title <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Type className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Professional Airport Pickup"
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-medium text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Describe what you offer in detail..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-medium text-gray-900 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category <span className="text-red-500">*</span></label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-medium text-gray-900 appearance-none"
                                    >
                                        <option value="">Select a category</option>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Origin</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                name="origin"
                                                value={formData.origin}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Sri Lanka"
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-medium text-gray-900"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Destination <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-green-500" />
                                            <input
                                                type="text"
                                                name="destination"
                                                value={formData.destination}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Melbourne"
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-medium text-gray-900"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Specific Location Area</label>
                                    <input
                                        type="text"
                                        name="specificLocation"
                                        value={formData.specificLocation}
                                        onChange={handleInputChange}
                                        placeholder="e.g., CBD, Carlton, Monash Campus"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-medium text-gray-900"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Pricing & Details */}
                        {currentStep === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                placeholder="0.00"
                                                min="0"
                                                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-medium text-gray-900"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Currency</label>
                                        <select
                                            name="currency"
                                            value={formData.currency}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-bold text-gray-900"
                                        >
                                            {CURRENCIES.map(cur => (
                                                <option key={cur.value} value={cur.value}>{cur.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Type</label>
                                        <select
                                            name="pricingType"
                                            value={formData.pricingType}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-medium text-gray-900"
                                        >
                                            {PRICING_TYPES.map(pt => (
                                                <option key={pt.value} value={pt.value}>{pt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Key Features (comma separated)</label>
                                    <input
                                        type="text"
                                        name="features"
                                        value={formData.features}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Air conditioning, WiFi, Luggage space"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-medium text-gray-900"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Capacity</label>
                                        <input
                                            type="number"
                                            name="maxCapacity"
                                            value={formData.maxCapacity}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 4"
                                            min="1"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-medium text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration</label>
                                        <input
                                            type="number"
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleInputChange}
                                            placeholder="2"
                                            min="1"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-medium text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Unit</label>
                                        <select
                                            name="durationType"
                                            value={formData.durationType}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition font-medium text-gray-900"
                                        >
                                            {DURATION_TYPES.map(dt => (
                                                <option key={dt.value} value={dt.value}>{dt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Availability</label>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {DAYS_OF_WEEK.map(day => (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => handleDayToggle(day)}
                                                className={`px-3 py-2 text-sm font-bold rounded-xl transition-all ${formData.availableDays.includes(day)
                                                    ? 'bg-green-600 text-white shadow-md'
                                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {day.slice(0, 3)}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <div className="grid grid-cols-2 gap-4">
                                            <TimeInput
                                                label="Start Time"
                                                value={formData.availableTimeSlot ? formData.availableTimeSlot.split(' - ')[0] : '09:00 AM'}
                                                onChange={(newTime) => {
                                                    const endTime = formData.availableTimeSlot ? formData.availableTimeSlot.split(' - ')[1] : '05:00 PM';
                                                    setFormData(prev => ({ ...prev, availableTimeSlot: `${newTime} - ${endTime}` }));
                                                }}
                                            />
                                            <TimeInput
                                                label="End Time"
                                                value={formData.availableTimeSlot ? formData.availableTimeSlot.split(' - ')[1] : '05:00 PM'}
                                                onChange={(newTime) => {
                                                    const startTime = formData.availableTimeSlot ? formData.availableTimeSlot.split(' - ')[0] : '09:00 AM';
                                                    setFormData(prev => ({ ...prev, availableTimeSlot: `${startTime} - ${newTime}` }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Images */}
                        {currentStep === 3 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        Upload Photos <span className="text-gray-400 font-normal">(Max 5)</span>
                                    </label>
                                    <div
                                        onDrop={handleImageDrop}
                                        onDragOver={handleDragOver}
                                        className="border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center hover:border-green-400 hover:bg-green-50 transition-all cursor-pointer bg-gray-50"
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageDrop}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                                                <Upload className="w-8 h-8 text-green-600" />
                                            </div>
                                            <p className="text-gray-900 font-bold mb-1">
                                                Click to upload or drag and drop
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                SVG, PNG, JPG or GIF (max. 5MB)
                                            </p>
                                        </label>
                                    </div>
                                </div>

                                {/* Image Gallery Grid */}
                                {(existingImageUrls.length > 0 || imagePreviews.length > 0) && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {existingImageUrls.map((url, index) => (
                                            <div key={`existing-${index}`} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-200">
                                                <img
                                                    src={url}
                                                    alt={`Existing ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingImage(index)}
                                                        className="p-2 bg-red-500 text-white rounded-full shadow-lg transform hover:scale-110 transition-transform"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {imagePreviews.map((preview, index) => (
                                            <div key={`new-${index}`} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-green-500/30">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="p-2 bg-red-500 text-white rounded-full shadow-lg transform hover:scale-110 transition-transform"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
                        <button
                            onClick={currentStep === 1 ? onClose : prevStep}
                            className="px-6 py-3 text-gray-700 font-bold hover:bg-gray-100 rounded-xl transition flex items-center gap-2"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            {currentStep === 1 ? 'Cancel' : 'Back'}
                        </button>

                        {currentStep < 3 ? (
                            <button
                                onClick={nextStep}
                                className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 flex items-center gap-2 transform hover:-translate-y-0.5"
                            >
                                Next Step
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        {isEditMode ? 'Update Service' : 'Publish Service'}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CreateGigForm;
