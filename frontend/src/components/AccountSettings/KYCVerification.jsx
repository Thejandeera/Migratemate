import React from 'react';
import { getUserData } from '../../utils/auth';
import { Check, Clock, AlertTriangle, Shield, User, FileText, Camera } from 'lucide-react';

const KYCVerification = () => {
    const user = getUserData();
    const passportUrl = user?.passportImageUrl;
    const selfieUrl = user?.selfieImageUrl;
    const isPassportUploaded = !!passportUrl;
    const isSelfieUploaded = !!selfieUrl;
    const isVerified = !!user?.isVerified;

    let progress = 33;
    if (isPassportUploaded) progress += 33;
    if (isSelfieUploaded) progress += 34;
    // Visually cap at 98 perct if not verified by admin yet but uploaded
    const visualProgress = isVerified ? 100 : Math.min(progress, 95);

    const steps = [
        {
            title: 'Create Account',
            description: 'Basic details registered',
            icon: User,
            completed: true,
            current: false
        },
        {
            title: 'Upload ID Document',
            description: 'Passport or National ID',
            icon: FileText,
            completed: isPassportUploaded,
            current: !isPassportUploaded
        },
        {
            title: 'Biometric Verification',
            description: 'Live selfie check',
            icon: Camera,
            completed: isSelfieUploaded,
            current: isPassportUploaded && !isSelfieUploaded
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Status Banner */}
            <div className={`rounded-3xl p-6 border-2 flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${isVerified
                    ? 'bg-green-50 border-green-100 shadow-green-100'
                    : 'bg-orange-50 border-orange-100 shadow-orange-100'
                } shadow-lg`}>
                <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md border-4 border-white ${isVerified ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                        }`}>
                        {isVerified ? <Shield className="w-8 h-8" /> : <Clock className="w-8 h-8 animate-pulse" />}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {isVerified ? 'Identity Verified' : 'Verification Required'}
                        </h3>
                        <p className={`font-medium ${isVerified ? 'text-green-700' : 'text-orange-700'}`}>
                            {isVerified
                                ? 'Your account is fully verified and secure.'
                                : 'Complete the steps below to unlock full access.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Progress</span>
                        <span className={`text-xl font-black ${isVerified ? 'text-green-600' : 'text-orange-500'}`}>
                            {Math.round(visualProgress)}%
                        </span>
                    </div>
                    <div className="w-16 h-16 relative">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent"
                                strokeDasharray={175}
                                strokeDashoffset={175 - (visualProgress / 100) * 175}
                                className={`transition-all duration-1000 ease-out ${isVerified ? 'text-green-500' : 'text-orange-500'}`}
                            />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Steps Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            Verification Steps
                        </h3>

                        <div className="space-y-8 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                            {steps.map((step, idx) => (
                                <div key={idx} className="relative flex items-center gap-6 group">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm relative z-10 transition-colors ${step.completed ? 'bg-green-500 text-white' :
                                            step.current ? 'bg-blue-600 text-white ring-4 ring-blue-50' :
                                                'bg-gray-200 text-gray-400'
                                        }`}>
                                        {step.completed ? <Check className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                                    </div>
                                    <div className={`flex-1 p-4 rounded-xl border transition-all ${step.current ? 'bg-blue-50 border-blue-100 shadow-sm' : 'bg-white border-transparent'
                                        }`}>
                                        <h4 className={`font-bold text-base ${step.completed ? 'text-green-700' : 'text-gray-900'}`}>{step.title}</h4>
                                        <p className="text-sm text-gray-500">{step.description}</p>
                                    </div>
                                    {step.completed && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Done</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Documents Preview */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Uploaded Documents</h3>
                        <div className="grid sm:grid-cols-2 gap-6">
                            {/* Passport */}
                            <div className="border border-gray-200 rounded-2xl p-4 hover:border-green-300 transition-colors bg-gray-50/50">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Passport / ID</h4>
                                        <p className="text-xs text-gray-500">{isPassportUploaded ? 'Uploaded on Registration' : 'Not Uploaded'}</p>
                                    </div>
                                    {isPassportUploaded ? <Check className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-gray-300" />}
                                </div>
                                {passportUrl ? (
                                    <a href={passportUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video bg-gray-200 rounded-lg overflow-hidden group">
                                        <img src={passportUrl} alt="Passport" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">View Document</span>
                                        </div>
                                    </a>
                                ) : (
                                    <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400 gap-2 border-2 border-dashed border-gray-200">
                                        <FileText className="w-8 h-8" />
                                        <span className="text-xs font-medium">No document</span>
                                    </div>
                                )}
                            </div>

                            {/* Selfie */}
                            <div className="border border-gray-200 rounded-2xl p-4 hover:border-green-300 transition-colors bg-gray-50/50">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Live Selfie</h4>
                                        <p className="text-xs text-gray-500">{isSelfieUploaded ? 'Uploaded on Registration' : 'Not Uploaded'}</p>
                                    </div>
                                    {isSelfieUploaded ? <Check className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-gray-300" />}
                                </div>
                                {selfieUrl ? (
                                    <a href={selfieUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video bg-gray-200 rounded-lg overflow-hidden group">
                                        <img src={selfieUrl} alt="Selfie" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">View Photo</span>
                                        </div>
                                    </a>
                                ) : (
                                    <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400 gap-2 border-2 border-dashed border-gray-200">
                                        <Camera className="w-8 h-8" />
                                        <span className="text-xs font-medium">No selfie</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Benefits */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        <h3 className="text-xl font-bold mb-4 relative z-10">Why Verify?</h3>
                        <ul className="space-y-4 relative z-10">
                            {[
                                { text: 'Trust Badge on Profile', icon: Shield },
                                { text: 'Unlock SOS Alerts', icon: AlertTriangle },
                                { text: 'Offer Services', icon: User }
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                                    <item.icon className="w-5 h-5 text-green-200" />
                                    <span className="font-medium text-sm">{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Security</h3>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-3">
                            <div className="bg-green-100 p-2 rounded-lg text-green-600">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-900">Data Encryption</h4>
                                <p className="text-xs text-gray-500">256-bit SSL Protection</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                <Check className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-900">Manual Review</h4>
                                <p className="text-xs text-gray-500">Verified by humans</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KYCVerification;
