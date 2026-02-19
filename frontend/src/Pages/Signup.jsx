import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Camera, Upload, Check, Mail, User, Phone, MapPin, Shield, CheckCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import Button from '../components/ui/Button';
import migrateIcon from '../assets/migrate-icon.png';

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
    };

    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row text-gray-900">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-20 relative bg-white min-h-screen">
                <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 group">
                    <img
                        src={migrateIcon}
                        alt="Logo"
                        className="w-10 h-10 object-contain"
                    />
                    <span className="font-semibold text-black tracking-tight text-lg">MigrateMate</span>
                </Link>

                <div className="max-w-md w-full">
                    <div className="text-center lg:text-left mb-10">
                        <span className="inline-block py-1 px-3 bg-[#1a3a1d]/10 text-deep-green rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                            Step {step} of 3
                        </span>
                        <h1 className="text-4xl md:text-5xl font-semibold text-black tracking-tight mb-4">Create Account</h1>
                        <p className="text-lg text-gray-500 font-normal leading-relaxed">
                            Join MigrateMate and settle with confidence.
                        </p>
                    </div>

                    {/* Progress Indicators */}
                    <div className="flex gap-2 mb-10">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1.5 rounded-full flex-1 transition-all ${i <= step ? 'bg-black' : 'bg-gray-100'}`}></div>
                        ))}
                    </div>

                    {error && (
                         <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm flex items-center mb-6 font-medium">
                            <Shield className="w-5 h-5 mr-3 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <AnimatePresence mode='wait'>
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="w-full px-6 py-4 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all placeholder:text-gray-400 font-medium text-[15px]" />
                                    <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="w-full px-6 py-4 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all placeholder:text-gray-400 font-medium text-[15px]" />
                                </div>

                                <div className="relative">
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={otpVerified}
                                        placeholder="Email Address"
                                        className={`w-full px-6 py-4 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all placeholder:text-gray-400 font-medium text-[15px] ${otpVerified ? 'bg-[#1a3a1d]/5 text-deep-green border-[#1a3a1d]/20' : ''}`}
                                    />
                                    {!otpVerified && !otpSent && (
                                        <button onClick={sendOtp} disabled={otpLoading} className="absolute right-2 top-2 bottom-2 px-5 bg-black text-white rounded-full text-xs font-bold hover:bg-gray-800 transition-all disabled:opacity-50">
                                            {otpLoading ? <Loader2 className="animate-spin w-3 h-3" /> : 'Verify'}
                                        </button>
                                    )}
                                </div>

                                {otpSent && !otpVerified && (
                                    <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100">
                                        <p className="text-xs font-bold text-gray-500 mb-2 ml-2">Verification Code</p>
                                        <div className="flex gap-2">
                                            <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="000000" className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-full text-center tracking-widest font-mono outline-none text-lg" maxLength={6} />
                                            <button onClick={verifyOtp} disabled={otpLoading} className="px-5 bg-deep-green text-white rounded-full text-xs font-bold hover:bg-[#2d5a32] transition-all">
                                                {otpLoading ? <Loader2 className="animate-spin w-3 h-3" /> : 'Confirm'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {otpVerified && <p className="text-deep-green text-xs font-bold ml-4 flex items-center gap-1"><CheckCircle size={14} /> Email Verified</p>}

                                <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" className="w-full px-6 py-4 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all placeholder:text-gray-400 font-medium text-[15px]" />
                                
                                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="w-full px-6 py-4 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all placeholder:text-gray-400 font-medium text-[15px]" />
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <input name="countryOfOrigin" value={formData.countryOfOrigin} onChange={handleChange} placeholder="Origin Country" className="w-full px-6 py-4 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all placeholder:text-gray-400 font-medium text-[15px]" />
                                     <input name="destinationCountry" value={formData.destinationCountry} onChange={handleChange} placeholder="Destination" className="w-full px-6 py-4 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all placeholder:text-gray-400 font-medium text-[15px]" />
                                </div>

                                <Button onClick={nextStep} className="w-full py-4 bg-[#1a3a1d] hover:bg-black rounded-full text-white text-[15px] font-semibold shadow-xl mt-6 transition-all hover:scale-[1.01]">
                                    Continue
                                </Button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <h3 className="text-xl font-semibold text-black">Upload Identity Documents</h3>
                                
                                <div className="space-y-4">
                                    <div className="relative group cursor-pointer">
                                        <input type="file" onChange={(e) => handleFileChange(e, 'avatarBase64')} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" accept="image/*" />
                                        <div className={`p-6 rounded-[2rem] border-2 border-dashed flex items-center gap-5 transition-all ${formData.avatarBase64 ? 'bg-[#1a3a1d]/5 border-deep-green' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'}`}>
                                            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm text-black">
                                                {formData.avatarBase64 ? <CheckCircle className="text-deep-green" /> : <ImageIcon />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-black text-lg">Profile Picture</p>
                                                <p className="text-sm text-gray-500 font-medium">{formData.avatarBase64 ? 'Uploaded successfully' : 'Tap to browse files'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                     <div className="relative group cursor-pointer">
                                        <input type="file" onChange={(e) => handleFileChange(e, 'passportImageBase64')} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" accept="image/*" />
                                        <div className={`p-6 rounded-[2rem] border-2 border-dashed flex items-center gap-5 transition-all ${formData.passportImageBase64 ? 'bg-[#1a3a1d]/5 border-deep-green' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'}`}>
                                            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm text-black">
                                                {formData.passportImageBase64 ? <CheckCircle className="text-deep-green" /> : <Upload />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-black text-lg">Passport Image</p>
                                                <p className="text-sm text-gray-500 font-medium">{formData.passportImageBase64 ? 'Uploaded successfully' : 'Tap to browse files'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <button onClick={prevStep} className="w-1/3 py-4 bg-gray-100 text-gray-600 rounded-full font-semibold hover:bg-gray-200">Back</button>
                                    <button onClick={nextStep} className="w-2/3 py-4 bg-[#1a3a1d] text-white rounded-full font-semibold hover:bg-black shadow-lg">Continue</button>
                                </div>
                            </motion.div>
                        )}
                        
                         {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <h3 className="text-xl font-semibold text-black">Liveness Check</h3>
                                
                                <div className="aspect-square bg-black rounded-[2rem] overflow-hidden relative shadow-2xl ring-4 ring-black/5">
                                    {!formData.selfieImageBase64 && !cameraActive && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                                            <Camera className="w-16 h-16 mb-6 opacity-30" />
                                            <p className="mb-6 text-lg font-medium opacity-80">We need to verify it's really you.</p>
                                            <button onClick={startCamera} className="px-8 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-all shadow-xl">Start Camera</button>
                                        </div>
                                    )}
                                    {cameraActive && !formData.selfieImageBase64 && (
                                        <>
                                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]"></video>
                                            <canvas ref={canvasRef} className="hidden"></canvas>
                                            <button onClick={captureSelfie} className="absolute bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-white/20 backdrop-blur-md rounded-full border-4 border-white p-1 hover:scale-110 transition-transform">
                                                <div className="w-full h-full bg-white rounded-full"></div>
                                            </button>
                                        </>
                                    )}
                                    {formData.selfieImageBase64 && (
                                        <>
                                            <img src={formData.selfieImageBase64} alt="Selfie" className="w-full h-full object-cover" />
                                            <button onClick={retakeSelfie} className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/60 text-white rounded-full text-sm font-bold backdrop-blur-md hover:bg-black/80 transition-colors">Retake Photo</button>
                                        </>
                                    )}
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <button onClick={prevStep} className="w-1/3 py-4 bg-gray-100 text-gray-600 rounded-full font-semibold hover:bg-gray-200">Back</button>
                                    <button 
                                        onClick={handleSubmit} 
                                        disabled={loading || !formData.selfieImageBase64}
                                        className="w-2/3 py-4 bg-[#1a3a1d] text-white rounded-full font-semibold hover:bg-black shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Complete Sign Up'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                     <div className="text-center mt-10">
                         <p className="text-gray-500 font-medium">Already a member? <Link to="/login" className="text-black font-semibold hover:underline">Sign In</Link></p>
                    </div>
                </div>
            </div>

            {/* Right Side - Features/Illustration (Similar to Login) */}
            <div className="hidden lg:flex w-1/2 bg-[#f4fbf0] justify-center items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1a3a1d]/5 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/3"></div>
                
                <div className="relative z-10 max-w-lg text-center">
                    {/* <img 
                        src="https://i.pinimg.com/736x/aa/1b/e4/aa1be4f6bea410b3626d7ef883abadee.jpg" 
                        alt="Signup Illustration" 
                        className="w-full h-auto drop-shadow-2xl mb-8 rounded-3xl object-cover"
                    /> */}
                    <h2 className="text-4xl font-semibold text-black leading-tight tracking-tight">Join 10,000+ happy migrants <br/>settling in effortlessly.</h2>
                    <div className="flex justify-center gap-3 mt-8">
                         <div className="w-2 h-2 bg-black/20 rounded-full"></div>
                        <div className="w-8 h-2 bg-black rounded-full"></div>
                        <div className="w-2 h-2 bg-black/20 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;