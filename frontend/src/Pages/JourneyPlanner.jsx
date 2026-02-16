import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, MapPin, DollarSign, Users, Calendar, ArrowRight, CheckCircle, Smartphone, Home, Briefcase } from 'lucide-react';
import Navbar from '../components/Navbar';
import { generateJourneyPlan } from '../utils/api';

const JourneyPlanner = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState(null);
    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        budget: 2000,
        timelineWeeks: 4,
        familySize: 1
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const result = await generateJourneyPlan(formData);
            setPlan(result);
            setStep(3); // Results step
        } catch (error) {
            console.error("Planning failed", error);
            alert("Something went wrong while generating your plan. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        Smart <span className="text-green-600">Journey Planner</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                        Let our AI orchestrate your perfect migration timeline. curated with real services and personalized advice.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    {/* Progress Steps */}
                    <div className="mb-8 flex justify-center items-center space-x-4">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`flex items-center ${step >= s ? 'text-green-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= s ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
                                    {step > s ? <CheckCircle size={16} /> : <span>{s}</span>}
                                </div>
                                {s < 3 && <div className={`w-12 h-0.5 mx-2 ${step > s ? 'bg-green-600' : 'bg-gray-300'}`} />}
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Basics */}
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-xl p-8"
                        >
                            <h2 className="text-2xl font-bold mb-6">Where are you going?</h2>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Origin Country</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                                            <input
                                                type="text" name="origin" value={formData.origin} onChange={handleInputChange}
                                                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="e.g. Sri Lanka"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Destination City</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 text-green-600" size={20} />
                                            <input
                                                type="text" name="destination" value={formData.destination} onChange={handleInputChange}
                                                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="e.g. Melbourne"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={nextStep} disabled={!formData.origin || !formData.destination}
                                        className="flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                                        Next Step <ArrowRight className="ml-2" size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Details */}
                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-xl p-8"
                        >
                            <h2 className="text-2xl font-bold mb-6">Refine your plan</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Budget (USD)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3 text-gray-400" size={20} />
                                        <input
                                            type="number" name="budget" value={formData.budget} onChange={handleInputChange}
                                            className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <input
                                        type="range" name="budget" min="500" max="20000" step="100"
                                        value={formData.budget} onChange={handleInputChange}
                                        className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Timeline (Weeks)</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
                                            <input
                                                type="number" name="timelineWeeks" value={formData.timelineWeeks} onChange={handleInputChange}
                                                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Family Size</label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-3 text-gray-400" size={20} />
                                            <input
                                                type="number" name="familySize" value={formData.familySize} onChange={handleInputChange}
                                                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <button onClick={prevStep} className="text-gray-600 hover:text-gray-900 font-medium">
                                        Back
                                    </button>
                                    <button onClick={handleSubmit} disabled={loading}
                                        className="flex items-center bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-70 transition-colors shadow-lg shadow-green-200">
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                Orchestrating Agents...
                                            </>
                                        ) : (
                                            <>Generate Plan <Plane className="ml-2" size={20} /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Results */}
                    {step === 3 && plan && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="space-y-8"
                        >
                            {/* Summary Card */}
                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
                                <h2 className="text-3xl font-bold mb-4">Your Journey Plan</h2>
                                <p className="text-green-50 text-lg leading-relaxed">{plan.summary}</p>
                                <div className="mt-6 flex flex-wrap gap-4">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center">
                                        <MapPin size={18} className="mr-2" /> {formData.origin} to {formData.destination}
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center">
                                        <DollarSign size={18} className="mr-2" /> Est. Budget: ${formData.budget}
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Phases */}
                            <div className="relative border-l-4 border-green-200 ml-4 space-y-12">
                                {plan.phases.map((phase, idx) => (
                                    <div key={idx} className="relative pl-8">
                                        <div className="absolute -left-3.5 top-0 bg-green-600 w-7 h-7 rounded-full border-4 border-white shadow-md"></div>

                                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{phase.phaseName}</h3>

                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                                            <div className="flex items-start mb-4">
                                                <Smartphone className="text-green-600 mt-1 mr-3 flex-shrink-0" size={24} />
                                                <p className="text-gray-600 italic">"{phase.aiAdvice}"</p>
                                            </div>

                                            {phase.recommendedServices && phase.recommendedServices.length > 0 && (
                                                <div className="mt-4">
                                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Recommended Services</h4>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {phase.recommendedServices.map((service, sIdx) => {
                                                            let Icon = Briefcase;
                                                            if (service.category === 'TRANSPORT') Icon = Plane;
                                                            if (service.category === 'HOUSING') Icon = Home;

                                                            return (
                                                                <div key={sIdx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors cursor-pointer border border-gray-100 hover:border-green-200 group">
                                                                    <div className="flex items-center">
                                                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                                                            <Icon size={20} />
                                                                        </div>
                                                                        <div className="ml-4">
                                                                            <h5 className="font-semibold text-gray-900">{service.title}</h5>
                                                                            <p className="text-xs text-gray-500">Provided by User #{service.providerId.substring(0, 6)}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="block font-bold text-gray-900">${service.price}</span>
                                                                        <span className="text-xs text-green-600 font-medium group-hover:underline">View Details</span>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center pb-12">
                                <button className="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors shadow-lg">
                                    Download Full Itinerary (PDF)
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JourneyPlanner;
