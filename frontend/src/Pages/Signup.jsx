import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';

const Signup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [stream, setStream] = useState(null);

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

    useEffect(() => {
        let currentStream = null;

        const initCamera = async () => {
            if (cameraActive) {
                try {
                    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
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

        initCamera();

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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSubmit),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert('Registration Successful! Please Login.');
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

    const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="min-h-screen bg-[#F0FDF4] font-sans">
            <Navbar />

            <div className="flex items-center justify-center min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-2xl relative">

                    <Link to="/" className="absolute -top-12 left-0 flex items-center gap-2 text-gray-600 hover:text-[#22C55E] transition-colors font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to Home
                    </Link>


                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Identity Verification</h2>
                            <span className="text-sm text-gray-500">Step {step} of 3</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <motion.div
                                className="bg-[#22C55E] h-2.5 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${(step / 3) * 100}%` }}
                            ></motion.div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
                    >
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <AnimatePresence mode='wait'>
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="bg-[#E0F2F1] p-2 rounded-lg">
                                                <svg className="w-6 h-6 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
                                                <input name="firstName" type="text" required value={formData.firstName} onChange={handleChange} className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E] focus:bg-white text-sm transition-all" placeholder="Jane" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                                                <input name="lastName" type="text" required value={formData.lastName} onChange={handleChange} className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E] focus:bg-white text-sm transition-all" placeholder="Doe" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                            <input name="email" type="email" required value={formData.email} onChange={handleChange} className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E] focus:bg-white text-sm transition-all" placeholder="jane@example.com" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                                            <input name="password" type="password" required value={formData.password} onChange={handleChange} className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E] focus:bg-white text-sm transition-all" placeholder="••••••••" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                                            <input name="phone" type="tel" value={formData.phone} onChange={handleChange} className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E] focus:bg-white text-sm transition-all" placeholder="+94 77 123 4567" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Country of Origin</label>
                                            <input name="countryOfOrigin" type="text" required value={formData.countryOfOrigin} onChange={handleChange} className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E] focus:bg-white text-sm transition-all" placeholder="Your Country" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Destination Country</label>
                                            <input name="destinationCountry" type="text" required value={formData.destinationCountry} onChange={handleChange} className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E] focus:bg-white text-sm transition-all" placeholder="Australia" />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="w-full mt-6 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#22C55E] hover:bg-[#16A34A] transition-all"
                                        >
                                            Continue to Document Upload
                                        </button>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="bg-[#E0F2F1] p-2 rounded-lg">
                                                <svg className="w-6 h-6 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">Upload ID Document</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#22C55E] hover:bg-green-50 transition-all relative">
                                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'passportImageBase64')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                                    <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                                                        <svg className="w-6 h-6 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z"></path></svg>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">Upload Passport</span>
                                                    <span className="text-xs text-gray-500 mt-1">PNG, JPG or PDF up to 10MB</span>
                                                    {formData.passportImageBase64 && <span className="text-xs text-[#22C55E] mt-2 font-semibold">File Selected</span>}
                                                </div>

                                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#22C55E] hover:bg-green-50 transition-all relative">
                                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'avatarBase64')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                                    <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                                                        <svg className="w-6 h-6 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">Upload Profile Picture</span>
                                                    <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                                                    {formData.avatarBase64 && <span className="text-xs text-[#22C55E] mt-2 font-semibold">File Selected</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 mt-8">
                                            <button type="button" onClick={prevStep} className="w-1/3 flex justify-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all">
                                                Back
                                            </button>
                                            <button type="button" onClick={nextStep} className="w-2/3 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#22C55E] hover:bg-[#16A34A] transition-all">
                                                Continue to Selfie
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="bg-[#E0F2F1] p-2 rounded-lg">
                                                <svg className="w-6 h-6 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">Take a Selfie</h3>
                                        </div>

                                        <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-[4/3] relative flex items-center justify-center border-2 border-dashed border-gray-300">
                                            {!formData.selfieImageBase64 && !cameraActive && (
                                                <div className="text-center p-6">
                                                    <button type="button" onClick={startCamera} className="px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition">Turn on Camera</button>
                                                </div>
                                            )}

                                            {cameraActive && !formData.selfieImageBase64 && (
                                                <div className="relative w-full h-full">
                                                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                                                    <canvas ref={canvasRef} className="hidden"></canvas>

                                                    <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
                                                        <button type="button" onClick={captureSelfie} className="w-16 h-16 bg-white rounded-full border-4 border-[#22C55E] flex items-center justify-center shadow-lg hover:bg-gray-100 transition-transform transform active:scale-95">
                                                            <div className="w-12 h-12 bg-[#22C55E] rounded-full"></div>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {formData.selfieImageBase64 && (
                                                <div className="relative w-full h-full">
                                                    <img src={formData.selfieImageBase64} alt="Selfie" className="w-full h-full object-cover" />
                                                    <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                                                        <button type="button" onClick={retakeSelfie} className="px-6 py-2 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full text-sm font-medium shadow-md hover:bg-white transition">Retake Selfie</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-4 mt-8">
                                            <button type="button" onClick={prevStep} className="w-1/3 flex justify-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all">
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading || !formData.selfieImageBase64}
                                                className={`w-2/3 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white transition-all ${loading || !formData.selfieImageBase64
                                                    ? 'bg-[#22C55E]/70 cursor-not-allowed'
                                                    : 'bg-[#22C55E] hover:bg-[#16A34A]'
                                                    }`}
                                            >
                                                {loading ? 'Verifying...' : 'Submit for Verification'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </motion.div>

                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-[#22C55E] hover:text-[#16A34A]">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;