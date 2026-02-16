import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, MapPin, DollarSign, Users, Calendar, ArrowRight, CheckCircle, Smartphone, Home, Briefcase, FileText, Download, Save, List as ListIcon, X, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import { generateJourneyPlan, saveJourneyPlan, getUserJourneyPlans } from '../utils/api';
import { getUserData } from '../utils/auth';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const JourneyPlanner = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState(null);
    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        budget: 2000,
        timelineWeeks: 4,
        familySize: 1,
        additionalInfo: ''
    });

    const [showSaveModal, setShowSaveModal] = useState(false);
    const [planName, setPlanName] = useState('');
    const [showMyPlans, setShowMyPlans] = useState(false);
    const [savedPlans, setSavedPlans] = useState([]);
    const [userData, setUserDataState] = useState(null);

    const reportRef = useRef(null);
    const hiddenPrintRef = useRef(null); // For PDF generation

    useEffect(() => {
        const user = getUserData();
        setUserDataState(user);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const result = await generateJourneyPlan(formData);
            setPlan(result);
            setStep(4); // Results step
        } catch (error) {
            console.error("Planning failed", error);
            alert("Something went wrong while generating your plan. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSavePlan = async () => {
        if (!planName.trim()) return;

        try {
            const planEntity = {
                userId: userData?.id,
                planName: planName,
                summary: plan.summary,
                phases: plan.phases,
                budget: formData.budget,
                origin: formData.origin,
                destination: formData.destination
            };

            await saveJourneyPlan(planEntity);
            setShowSaveModal(false);
            setPlanName('');
            alert('Plan saved successfully!');
            fetchSavedPlans(); // Refresh list if open
        } catch (error) {
            console.error("Failed to save plan", error);
            alert("Failed to save plan.");
        }
    };

    const fetchSavedPlans = async () => {
        if (!userData?.id) return;
        try {
            const plans = await getUserJourneyPlans(userData.id);
            setSavedPlans(plans);
        } catch (error) {
            console.error("Failed to fetch plans", error);
        }
    };

    const handleOpenMyPlans = () => {
        fetchSavedPlans();
        setShowMyPlans(true);
    };

    const loadSavedPlan = (savedPlan) => {
        setFormData({
            origin: savedPlan.origin,
            destination: savedPlan.destination,
            budget: savedPlan.budget,
            timelineWeeks: 4, // Default or store if needed
            familySize: 1, // Default or store if needed
            additionalInfo: ''
        });
        setPlan(savedPlan);
        setStep(4);
        setShowMyPlans(false);
    };

    const downloadPDF = async () => {
        // Use the hidden print view for better quality
        const element = hiddenPrintRef.current;
        if (!element) return;

        // Temporarily make it visible/absolute to rendering library can capture it properly
        element.style.display = 'block';

        try {
            const dataUrl = await toPng(element, { cacheBust: true, backgroundColor: '#ffffff', pixelRatio: 2 });

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgProps = pdf.getImageProperties(dataUrl);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`MigrateMate_Plan_${formData.destination}.pdf`);
        } catch (err) {
            console.error("PDF Export failed", err);
            alert("Could not generate PDF. Please try again.");
        } finally {
            element.style.display = 'none';
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <div></div> {/* Spacer */}
                    {userData && (
                        <button onClick={handleOpenMyPlans} className="flex items-center text-gray-600 hover:text-green-600 font-medium transition-colors">
                            <ListIcon className="mr-2" size={20} /> My Saved Plans
                        </button>
                    )}
                </div>

                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 lg:text-5xl">
                        Smart <span className="text-green-600">Journey Planner</span>
                    </h1>
                    <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                        Let our AI orchestrate your perfect migration timeline. curated with real services and personalized advice.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    {/* Progress Steps */}
                    <div className="mb-8 flex justify-center items-center space-x-2 sm:space-x-4">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className={`flex items-center ${step >= s ? 'text-green-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= s ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
                                    {step > s ? <CheckCircle size={16} /> : <span className="text-sm font-bold">{s}</span>}
                                </div>
                                {s < 4 && <div className={`w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 ${step > s ? 'bg-green-600' : 'bg-gray-300'}`} />}
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Basics */}
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-xl p-6 sm:p-8"
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
                                                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
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
                                                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                                placeholder="e.g. Melbourne"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={nextStep} disabled={!formData.origin || !formData.destination}
                                        className="flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors w-full sm:w-auto justify-center">
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
                            className="bg-white rounded-2xl shadow-xl p-6 sm:p-8"
                        >
                            <h2 className="text-2xl font-bold mb-6">Refine your plan</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Budget (USD)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3 text-gray-400" size={20} />
                                        <input
                                            type="number" name="budget" value={formData.budget} onChange={handleInputChange}
                                            className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
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
                                                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Family Size</label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-3 text-gray-400" size={20} />
                                            <input
                                                type="number" name="familySize" value={formData.familySize} onChange={handleInputChange}
                                                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <button onClick={prevStep} className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2">
                                        Back
                                    </button>
                                    <button onClick={nextStep}
                                        className="flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-200">
                                        Next <ArrowRight className="ml-2" size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Additional Info */}
                    {step === 3 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-xl p-6 sm:p-8"
                        >
                            <h2 className="text-2xl font-bold mb-6">Final Details</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Any specific requirements or notes?</label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 text-gray-400" size={20} />
                                        <textarea
                                            name="additionalInfo" value={formData.additionalInfo} onChange={handleInputChange}
                                            rows="4"
                                            className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                            placeholder="e.g. I need pet-friendly housing, looking for schools near CBD, prefer public transport..."
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Our AI will key this into consideration when planning your journey.</p>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <button onClick={prevStep} className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2">
                                        Back
                                    </button>
                                    <button onClick={handleSubmit} disabled={loading}
                                        className="flex items-center bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-70 transition-colors shadow-lg shadow-green-200 w-full sm:w-auto justify-center">
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                Orchestrating...
                                            </>
                                        ) : (
                                            <>Generate Plan <Plane className="ml-2" size={20} /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Results */}
                    {step === 4 && plan && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="space-y-8"
                        >
                            {/* Actions Toolbar */}
                            <div className="flex flex-wrap gap-3 justify-end items-center">
                                <button onClick={resetPlanner} className="text-gray-500 hover:text-red-500 font-medium px-3 py-2 mr-auto transition-colors">
                                    Start New Plan
                                </button>
                                <button onClick={() => setShowSaveModal(true)} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
                                    <Save size={18} /> Save Plan
                                </button>
                                <button onClick={downloadPDF} className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors shadow-lg">
                                    <Download size={18} /> Download PDF
                                </button>
                            </div>

                            {/* View Ref (Screen) */}
                            <div ref={reportRef} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b pb-4 gap-4">
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Migration Plan</h1>
                                        <p className="text-gray-500">Generated by MigrateMate AI</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <div className="text-green-600 font-bold text-lg sm:text-xl">
                                            {formData.origin} <ArrowRight className="inline mx-2" size={16} /> {formData.destination}
                                        </div>
                                        <p className="text-sm text-gray-500">Budget: ${formData.budget}</p>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white mb-8">
                                    <h2 className="text-xl sm:text-2xl font-bold mb-4">Executive Summary</h2>
                                    <p className="text-green-50 text-base sm:text-lg leading-relaxed">{plan.summary}</p>
                                </div>

                                {/* Timeline */}
                                <div className="relative border-l-4 border-green-200 ml-2 sm:ml-4 space-y-10">
                                    {plan.phases.map((phase, idx) => (
                                        <div key={idx} className="relative pl-6 sm:pl-8">
                                            <div className="absolute -left-3.5 top-0 bg-green-600 w-7 h-7 rounded-full border-4 border-white shadow-md"></div>

                                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{phase.phaseName}</h3>

                                            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 sm:p-6 mb-6">
                                                <div className="flex items-start mb-4">
                                                    <Smartphone className="text-green-600 mt-1 mr-3 flex-shrink-0" size={24} />
                                                    <div className="text-gray-600 prose prose-sm max-w-none">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {phase.aiAdvice}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>

                                                {phase.recommendedServices && phase.recommendedServices.length > 0 && (
                                                    <div className="mt-4">
                                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Recommended Services</h4>
                                                        <div className="grid grid-cols-1 gap-3">
                                                            {phase.recommendedServices.map((service, sIdx) => {
                                                                let Icon = Briefcase;
                                                                if (service.category === 'TRANSPORT') Icon = Plane;
                                                                if (service.category === 'HOUSING') Icon = Home;

                                                                return (
                                                                    <div key={sIdx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                                                                        <div className="flex items-center">
                                                                            <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                                                                <Icon size={16} />
                                                                            </div>
                                                                            <div className="ml-3">
                                                                                <h5 className="font-semibold text-gray-900 text-sm">{service.title}</h5>
                                                                                <p className="text-xs text-gray-500">ID: {service.providerId.substring(0, 6)}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <span className="block font-bold text-gray-900 text-sm">${service.price}</span>
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
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Hidden Print View (Optimized for A4) */}
            {plan && (
                <div ref={hiddenPrintRef} style={{ display: 'none', width: '210mm', minHeight: '297mm', padding: '15mm', backgroundColor: 'white' }}>
                    <div style={{ paddingBottom: '20px', borderBottom: '2px solid #22c55e', marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <h1 style={{ fontSize: '24pt', fontWeight: 'bold', color: '#111827' }}>Migration Journey Plan</h1>
                            <p style={{ color: '#6b7280', fontSize: '12pt' }}>Prepared by MigrateMate AI</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#22c55e', fontSize: '14pt', fontWeight: 'bold' }}>{formData.origin} to {formData.destination}</div>
                            <p style={{ color: '#6b7280' }}>Budget: ${formData.budget}</p>
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                        <h2 style={{ fontSize: '16pt', fontWeight: 'bold', color: '#15803d', marginBottom: '10px' }}>Executive Summary</h2>
                        <p style={{ fontSize: '11pt', lineHeight: '1.5', color: '#374151' }}>{plan.summary}</p>
                    </div>

                    <div style={{ marginLeft: '10px' }}>
                        {plan.phases.map((phase, idx) => (
                            <div key={idx} style={{ marginBottom: '30px', borderLeft: '3px solid #e5e7eb', paddingLeft: '20px' }}>
                                <h3 style={{ fontSize: '14pt', fontWeight: 'bold', color: '#111827', marginBottom: '10px' }}>{phase.phaseName}</h3>
                                <div style={{ fontSize: '10pt', color: '#4b5563', lineHeight: '1.6', marginBottom: '15px' }}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{phase.aiAdvice}</ReactMarkdown>
                                </div>
                                {phase.recommendedServices && phase.recommendedServices.length > 0 && (
                                    <div style={{ marginTop: '10px' }}>
                                        <h4 style={{ fontSize: '10pt', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' }}>Recommended Services</h4>
                                        {phase.recommendedServices.map((service, sIdx) => (
                                            <div key={sIdx} style={{ padding: '8px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', fontSize: '10pt' }}>
                                                <span>{service.title}</span>
                                                <span style={{ fontWeight: 'bold' }}>${service.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Save Modal */}
            <AnimatePresence>
                {showSaveModal && (
                    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold mb-4">Save Your Plan</h3>
                            <input
                                type="text"
                                value={planName}
                                onChange={(e) => setPlanName(e.target.value)}
                                placeholder="Give your plan a name (e.g., London 2026)"
                                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-green-500 outline-none"
                                autoFocus
                            />
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setShowSaveModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button onClick={handleSavePlan} disabled={!planName.trim()} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">Save</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* My Plans Modal */}
            <AnimatePresence>
                {showMyPlans && (
                    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                                <h3 className="text-xl font-bold">My Saved Plans</h3>
                                <button onClick={() => setShowMyPlans(false)} className="text-gray-500 hover:text-red-500"><X /></button>
                            </div>

                            <div className="overflow-y-auto p-6 flex-1">
                                {savedPlans.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">
                                        <FileText className="mx-auto mb-3 opacity-50" size={48} />
                                        <p>No saved plans yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {savedPlans.map((p) => (
                                            <div key={p.id} onClick={() => loadSavedPlan(p)} className="border border-gray-200 rounded-xl p-4 hover:border-green-500 hover:bg-green-50 cursor-pointer transition-all">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{p.planName}</h4>
                                                        <p className="text-sm text-gray-600 mt-1">{p.origin} to {p.destination}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">${p.budget}</span>
                                                        <p className="text-xs text-gray-400 mt-2 flex items-center justify-end"><Clock size={12} className="mr-1" />{new Date(p.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default JourneyPlanner;
