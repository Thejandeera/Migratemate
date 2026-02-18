import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { ArrowRight, ArrowLeft, Camera, Upload, Check, Mail, User, Phone, MapPin, Shield, CheckCircle, Loader2, Image as ImageIcon } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [stream, setStream] = useState(null);

    // OTP State
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        countryOfOrigin: '',
        destinationCountry: '',
        avatarBase64: '',
        passportImageBase64: '',
        selfieImageBase64: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev) => ({
                    ...prev,
                    [fieldName]: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const sendOtp = async () => {
        if (!formData.email) {
            setError("Please enter your email first.");
            return;
        }
        setOtpLoading(true);
        setError('');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/send-otp?email=${formData.email}`, {
                method: 'POST'
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setOtpSent(true);
            } else {
                setError(data.message || "Failed to send OTP.");
            }
        } catch (err) {
            setError("Network error sending OTP.");
        } finally {
            setOtpLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (!otp) {
            setError("Please enter the OTP.");
            return;
        }
        setOtpLoading(true);
        setError('');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/verify-otp?email=${formData.email}&otp=${otp}`, {
                method: 'POST'
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setOtpVerified(true);
            } else {
                setError(data.message || "Invalid OTP.");
            }
        } catch (err) {
            setError("Network error verifying OTP.");
        } finally {
            setOtpLoading(false);
        }
    };

    useEffect(() => {
        let currentStream = null;

        const initCamera = async () => {
            if (cameraActive) {
                try {
                    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
                    currentStream = mediaStream;
                    setStream(mediaStream);

                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    setError("Could not access camera. Please allow permissions.");
                    setCameraActive(false);
                }
            }
        };

        if (cameraActive) {
            initCamera();
        }

        return () => {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraActive]);

    const startCamera = () => {
        setError('');
        setCameraActive(true);
    };

    const captureSelfie = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;

            context.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
            const imageSrc = canvasRef.current.toDataURL('image/png');

            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }

            setCameraActive(false);
            setFormData(prev => ({ ...prev, selfieImageBase64: imageSrc }));
        }
    };

    const retakeSelfie = () => {
        setFormData(prev => ({ ...prev, selfieImageBase64: '' }));
        setError('');
        setCameraActive(true);
    };

    const registerUser = async (dataToSubmit) => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSubmit),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                navigate('/');
            } else {
                setError(data.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError('Network error. Is the backend server running?');
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        registerUser(formData);
    };

    const nextStep = () => {
        setError('');
        if (step === 1) {
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phone || !formData.countryOfOrigin || !formData.destinationCountry) {
                setError("Please fill in all fields to continue.");
                return;
            }
            if (!otpVerified) {
                setError("Please verify your email to continue.");
                return;
            }
        }
        if (step === 2) {
            if (!formData.passportImageBase64 || !formData.avatarBase64) {
                setError("Please upload both your Passport and Profile Picture.");
                return;
            }
        }
        setStep(prev => Math.min(prev + 1, 3));
        window.scrollTo(0, 0);
    };

    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const steps = [
        { id: 1, title: "Personal Details", icon: User },
        { id: 2, title: "Identity Upload", icon: Upload },
        { id: 3, title: "Liveness Check", icon: Camera }
    ];

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col">
            <Navbar />

            <div className="flex-1 pt-20 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">

                        {/* Left Side: Steps & Info */}
                        <div className="lg:w-1/3">
                            <div className="sticky top-28">
                                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Create Account</h1>
                                <p className="text-gray-500 mb-8">Join the community in a few simple steps.</p>

                                <div className="space-y-8 relative">
                                    <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-100 -z-10"></div>
                                    {steps.map((s) => (
                                        <div key={s.id} className="flex items-center gap-4 relative">
                                            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm bg-white ${step === s.id ? 'border-green-500 text-green-600' :
                                                    step > s.id ? 'border-green-500 bg-green-500 text-white' : 'border-gray-200 text-gray-300'
                                                }`}>
                                                {step > s.id ? <Check size={20} /> : <s.icon size={20} />}
                                            </div>
                                            <div>
                                                <h3 className={`font-bold text-sm ${step === s.id ? 'text-gray-900' : 'text-gray-400'}`}>{s.title}</h3>
                                                {step === s.id && <p className="text-xs text-green-600 font-medium">In Progress</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-12 bg-green-50 p-6 rounded-2xl border border-green-100 hidden lg:block">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-green-100 p-2 rounded-lg text-green-600">
                                            <Shield size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">Why do we need this?</h4>
                                            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                                We verify every member to ensure the safety and trust of our community. Your data is encrypted and secure.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Form */}
                        <div className="lg:w-2/3">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-3xl lg:shadow-xl lg:border border-gray-100 lg:p-8"
                            >
                                {error && (
                                    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center">
                                        <Shield className="w-5 h-5 mr-3" />
                                        {error}
                                    </div>
                                )}

                                <AnimatePresence mode='wait'>
                                    {step === 1 && (
                                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                                                    <input name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" placeholder="Jane" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                                                    <input name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" placeholder="Doe" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                                <div className="flex gap-3">
                                                    <input
                                                        name="email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        disabled={otpVerified}
                                                        className={`flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all ${otpVerified ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
                                                        placeholder="name@example.com"
                                                    />
                                                    {!otpVerified && !otpSent && (
                                                        <button
                                                            onClick={sendOtp}
                                                            disabled={otpLoading}
                                                            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-50"
                                                        >
                                                            {otpLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Verify'}
                                                        </button>
                                                    )}
                                                </div>

                                                {otpSent && !otpVerified && (
                                                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-4">
                                                        <label className="block text-xs font-bold text-gray-500 mb-2">Enter verification code sent to your email</label>
                                                        <div className="flex gap-3">
                                                            <input
                                                                value={otp}
                                                                onChange={(e) => setOtp(e.target.value)}
                                                                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-center tracking-widest font-mono"
                                                                placeholder="000000"
                                                                maxLength={6}
                                                            />
                                                            <button
                                                                onClick={verifyOtp}
                                                                disabled={otpLoading}
                                                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700"
                                                            >
                                                                {otpLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Confirm'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                {otpVerified && <p className="text-green-600 text-xs font-bold mt-2 flex items-center gap-1"><CheckCircle size={14} /> Email Verified Successfully</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                                                <input name="password" type="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" placeholder="Create a strong password" />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                                                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" placeholder="+1 (555) 000-0000" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Origin Country</label>
                                                    <input name="countryOfOrigin" value={formData.countryOfOrigin} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" placeholder="e.g. Brazil" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Destination Country</label>
                                                <input name="destinationCountry" value={formData.destinationCountry} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" placeholder="e.g. Canada" />
                                            </div>

                                            <button onClick={nextStep} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 hover:shadow-green-300 transition-all flex items-center justify-center gap-2 group">
                                                Continue
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Passport Upload */}
                                                <div className="relative group cursor-pointer">
                                                    <input type="file" onChange={(e) => handleFileChange(e, 'passportImageBase64')} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" accept="image/*" />
                                                    <div className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all h-64 ${formData.passportImageBase64 ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-400 hover:bg-gray-50'}`}>
                                                        {formData.passportImageBase64 ? (
                                                            <img src={formData.passportImageBase64} alt="Passport" className="w-full h-full object-contain rounded-lg" />
                                                        ) : (
                                                            <>
                                                                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                                                    <Upload className="w-6 h-6 text-green-600" />
                                                                </div>
                                                                <h4 className="font-bold text-gray-900">Upload Password</h4>
                                                                <p className="text-xs text-gray-500 mt-1">Click to browse</p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Avatar Upload */}
                                                <div className="relative group cursor-pointer">
                                                    <input type="file" onChange={(e) => handleFileChange(e, 'avatarBase64')} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" accept="image/*" />
                                                    <div className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all h-64 ${formData.avatarBase64 ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-400 hover:bg-gray-50'}`}>
                                                        {formData.avatarBase64 ? (
                                                            <img src={formData.avatarBase64} alt="Avatar" className="w-32 h-32 object-cover rounded-full shadow-md" />
                                                        ) : (
                                                            <>
                                                                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                                                    <ImageIcon className="w-6 h-6 text-green-600" />
                                                                </div>
                                                                <h4 className="font-bold text-gray-900">Profile Picture</h4>
                                                                <p className="text-xs text-gray-500 mt-1">Click to browse</p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                <button onClick={prevStep} className="w-1/3 py-4 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">Back</button>
                                                <button onClick={nextStep} className="w-2/3 py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-all">Continue</button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 3 && (
                                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                            <div className="bg-gray-900 rounded-3xl overflow-hidden aspect-[4/3] relative flex items-center justify-center">
                                                {!formData.selfieImageBase64 && !cameraActive && (
                                                    <div className="text-center">
                                                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                            <Camera className="w-8 h-8 text-gray-400" />
                                                        </div>
                                                        <button onClick={startCamera} className="px-8 py-3 bg-white text-gray-900 rounded-full font-bold hover:scale-105 transition-transform">
                                                            Start Camera
                                                        </button>
                                                    </div>
                                                )}

                                                {cameraActive && !formData.selfieImageBase64 && (
                                                    <div className="relative w-full h-full">
                                                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]"></video>
                                                        <canvas ref={canvasRef} className="hidden"></canvas>
                                                        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
                                                            <button onClick={captureSelfie} className="w-20 h-20 bg-white rounded-full border-4 border-green-500 p-1 cursor-pointer hover:scale-110 transition-transform">
                                                                <div className="w-full h-full bg-white rounded-full border-2 border-gray-100"></div>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {formData.selfieImageBase64 && (
                                                    <div className="relative w-full h-full">
                                                        <img src={formData.selfieImageBase64} alt="Selfie" className="w-full h-full object-cover" />
                                                        <button onClick={retakeSelfie} className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/50 backdrop-blur-md text-white rounded-full text-sm font-bold border border-white/20 hover:bg-black/70 transition-all">
                                                            Retake Photo
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-4 pt-4">
                                                <button onClick={prevStep} className="w-1/3 py-4 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">Back</button>
                                                <button
                                                    onClick={handleSubmit}
                                                    disabled={loading || !formData.selfieImageBase64}
                                                    className="w-2/3 py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                >
                                                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Complete Registration'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            <p className="text-center text-sm text-gray-500 mt-8">
                                Already have an account? <Link to="/login" className="text-green-600 font-bold hover:text-green-700">Log in</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;