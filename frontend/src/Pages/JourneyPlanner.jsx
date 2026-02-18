import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plane, MapPin, DollarSign, Users, Calendar, ArrowRight, CheckCircle,
    Smartphone, Home, Briefcase, FileText, Download, Save, List as ListIcon,
    X, Clock, Sparkles, Trash2, ChevronLeft, ChevronRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { generateJourneyPlan, saveJourneyPlan, getUserJourneyPlans, deleteJourneyPlan } from '../utils/api';
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
        budget: 5000,
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
    const hiddenPrintRef = useRef(null);

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
            setStep(4);
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
            fetchSavedPlans();
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
            timelineWeeks: 4,
            familySize: 1,
            additionalInfo: ''
        });
        setPlan(savedPlan);
        setStep(4);
        setShowMyPlans(false);
    };

    const resetPlanner = () => {
        setFormData({
            origin: '',
            destination: '',
            budget: 5000,
            timelineWeeks: 4,
            familySize: 1,
            additionalInfo: ''
        });
        setPlan(null);
        setStep(1);
    };

    const downloadPDF = async () => {
        const element = hiddenPrintRef.current;
        if (!element) return;
        element.style.display = 'block';
        try {
            const dataUrl = await toPng(element, { cacheBust: true, backgroundColor: '#ffffff', pixelRatio: 2 });
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const bottomMargin = 20;
            const contentHeightPerPage = pdfHeight - bottomMargin;
            const imgProps = pdf.getImageProperties(dataUrl);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, contentHeightPerPage, pdfWidth, bottomMargin, 'F');
            heightLeft -= contentHeightPerPage;

            while (heightLeft > 0) {
                position -= contentHeightPerPage;
                pdf.addPage();
                pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
                pdf.setFillColor(255, 255, 255);
                pdf.rect(0, contentHeightPerPage, pdfWidth, bottomMargin, 'F');
                heightLeft -= contentHeightPerPage;
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

    const handleDeletePlan = async (e, planId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this plan?')) {
            try {
                await deleteJourneyPlan(planId);
                setSavedPlans(prev => prev.filter(p => p.id !== planId));
            } catch (error) {
                console.error("Failed to delete plan", error);
                alert("Failed to delete plan. Please try again.");
            }
        }
    };

    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans flex flex-col">
            <Navbar />

            {/* Background Decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-100/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <main className="flex-grow pt-28 pb-20 relative z-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                                <Sparkles className="w-3.5 h-3.5" />
                                AI-Powered
                            </div>
                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                                Journey Planner
                            </h1>
                            <p className="text-gray-500 mt-2 text-lg">
                                Design your perfect migration timeline in minutes.
                            </p>
                        </div>

                        {userData && (
                            <button
                                onClick={handleOpenMyPlans}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-green-500 hover:text-green-600 transition-all shadow-sm"
                            >
                                <ListIcon className="w-4 h-4" />
                                My Saved Plans
                            </button>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between relative">
                            {/* Line */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full -z-10"></div>
                            <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 rounded-full -z-10 transition-all duration-500"
                                style={{ width: `${((step - 1) / 3) * 100}%` }}
                            ></div>

                            {[1, 2, 3, 4].map((s) => (
                                <div key={s} className="flex flex-col items-center gap-2 bg-gray-50/50 px-2">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${step >= s
                                                ? 'bg-green-500 border-green-100 text-white shadow-lg shadow-green-200'
                                                : 'bg-white border-gray-200 text-gray-400'
                                            }`}
                                    >
                                        {step > s ? <CheckCircle className="w-5 h-5" /> : <span className="font-bold text-sm">{s}</span>}
                                    </div>
                                    <span className={`text-xs font-bold uppercase tracking-wider ${step >= s ? 'text-green-600' : 'text-gray-400'}`}>
                                        {s === 1 ? 'Location' : s === 2 ? 'Details' : s === 3 ? 'Reqs' : 'Plan'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" variants={fadeIn} initial="hidden" animate="visible" exit="exit" className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-bl-full -mr-16 -mt-16 z-0"></div>
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Where are you going?</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Origin Country</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <MapPin className="text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="origin"
                                                    value={formData.origin}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
                                                    placeholder="e.g. India"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Destination City</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Plane className="text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="destination"
                                                    value={formData.destination}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
                                                    placeholder="e.g. Sydney"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={nextStep}
                                            disabled={!formData.origin || !formData.destination}
                                            className="group bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2 hover:-translate-y-1"
                                        >
                                            Next Step <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" variants={fadeIn} initial="hidden" animate="visible" exit="exit" className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-8">Refine your details</h2>
                                <div className="space-y-8 mb-10">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Total Budget</label>
                                            <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-lg">${formData.budget.toLocaleString()}</span>
                                        </div>
                                        <input
                                            type="range"
                                            name="budget"
                                            min="1000"
                                            max="50000"
                                            step="500"
                                            value={formData.budget}
                                            onChange={handleInputChange}
                                            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                                            <span>$1,000</span>
                                            <span>$50,000+</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Timeline (Weeks)</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Calendar className="text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                                </div>
                                                <input
                                                    type="number"
                                                    name="timelineWeeks"
                                                    value={formData.timelineWeeks}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Family Size</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Users className="text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                                </div>
                                                <input
                                                    type="number"
                                                    name="familySize"
                                                    value={formData.familySize}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={prevStep}
                                        className="text-gray-500 font-bold hover:text-gray-700 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={nextStep}
                                        className="group bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 transition-all flex items-center gap-2 hover:-translate-y-1"
                                    >
                                        Next Step <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" variants={fadeIn} initial="hidden" animate="visible" exit="exit" className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-8">Personalize the Results</h2>
                                <div className="space-y-6 mb-10">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Specific Requirements</label>
                                        <div className="relative group">
                                            <textarea
                                                name="additionalInfo"
                                                value={formData.additionalInfo}
                                                onChange={handleInputChange}
                                                rows="5"
                                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400 resize-none"
                                                placeholder="e.g. 'I need pet-friendly housing', 'Looking for schools near CBD', 'Prefer public transport over driving'..."
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 font-medium flex items-center gap-1">
                                            <Sparkles className="w-3 h-3 text-green-500" />
                                            Our AI uses this to tailor recommendations specifically for you.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={prevStep}
                                        className="text-gray-500 font-bold hover:text-gray-700 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 transition-all flex items-center gap-2 hover:-translate-y-1 disabled:opacity-70 disabled:shadow-none"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Generating Plan...
                                            </>
                                        ) : (
                                            <>Generate Plan <Sparkles className="w-5 h-5" /></>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && plan && (
                            <motion.div key="step4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
                                {/* Toolbar */}
                                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between sticky top-24 z-20">
                                    <button onClick={resetPlanner} className="text-gray-500 hover:text-red-500 font-bold px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 text-sm">
                                        <Trash2 className="w-4 h-4" /> Start Over
                                    </button>
                                    <div className="flex gap-3">
                                        <button onClick={() => setShowSaveModal(true)} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all text-sm">
                                            <Save className="w-4 h-4" /> Save
                                        </button>
                                        <button onClick={downloadPDF} className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all text-sm hover:-translate-y-0.5">
                                            <Download className="w-4 h-4" /> Download PDF
                                        </button>
                                    </div>
                                </div>

                                {/* Report View */}
                                <div ref={reportRef} className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-12">
                                    {/* Report Header */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-6 border-b border-gray-100">
                                        <div>
                                            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Migration Strategy</h1>
                                            <p className="text-gray-500 font-medium">Prepared for {userData?.firstName || 'User'}</p>
                                        </div>
                                        <div className="text-left sm:text-right mt-4 sm:mt-0 bg-green-50 p-4 rounded-xl border border-green-100">
                                            <div className="text-green-700 font-bold text-lg flex items-center gap-2">
                                                {formData.origin} <ArrowRight className="w-4 h-4" /> {formData.destination}
                                            </div>
                                            <p className="text-sm text-green-600/80 font-medium mt-1">Budget: ${formData.budget.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Executive Summary */}
                                    <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl shadow-lg p-8 text-white mb-12">
                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-green-200" /> Executive Summary
                                        </h2>
                                        <p className="text-green-50 text-lg leading-relaxed font-medium opacity-95">{plan.summary}</p>
                                    </div>

                                    {/* Timeline Phases */}
                                    <div className="space-y-12 relative">
                                        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-200 rounded-full"></div>

                                        {plan.phases.map((phase, idx) => (
                                            <div key={idx} className="relative pl-12">
                                                <div className="absolute left-0 top-1 w-10 h-10 bg-white border-4 border-green-500 rounded-full flex items-center justify-center shadow-sm z-10">
                                                    <span className="text-green-700 font-bold text-sm">{idx + 1}</span>
                                                </div>

                                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{phase.phaseName}</h3>

                                                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 sm:p-8">
                                                    {/* AI Advice */}
                                                    <div className="flex items-start gap-4 mb-8">
                                                        <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 text-green-600">
                                                            <Smartphone className="w-6 h-6" />
                                                        </div>
                                                        <div className="prose prose-sm prose-gray max-w-none">
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                {phase.aiAdvice}
                                                            </ReactMarkdown>
                                                        </div>
                                                    </div>

                                                    {/* Recommended Services */}
                                                    {phase.recommendedServices && phase.recommendedServices.length > 0 && (
                                                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                                            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
                                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                                                    <Briefcase className="w-4 h-4" /> Recommended Services
                                                                </h4>
                                                            </div>
                                                            <div className="divide-y divide-gray-100">
                                                                {phase.recommendedServices.map((service, sIdx) => {
                                                                    let Icon = Briefcase;
                                                                    if (service.category === 'TRANSPORT') Icon = Plane;
                                                                    if (service.category === 'HOUSING') Icon = Home;

                                                                    return (
                                                                        <div key={sIdx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                                            <div className="flex items-center gap-4">
                                                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                                                                    <Icon className="w-5 h-5" />
                                                                                </div>
                                                                                <div>
                                                                                    <h5 className="font-bold text-gray-900 text-sm">{service.title}</h5>
                                                                                    <p className="text-xs text-gray-500">Provider: {service.providerId.substring(0, 8)}...</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <span className="block font-bold text-green-600">${service.price}</span>
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
                    </AnimatePresence>
                </div>

                {/* Hidden Print View */}
                {plan && (
                    <div ref={hiddenPrintRef} style={{ display: 'none', width: '210mm', minHeight: '297mm', padding: '15mm', backgroundColor: 'white' }}>
                        <div style={{ paddingBottom: '20px', borderBottom: '2px solid #22c55e', marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <h1 style={{ fontSize: '24pt', fontWeight: 'bold', color: '#111827' }}>Migration Plan</h1>
                                <p style={{ color: '#6b7280', fontSize: '12pt' }}>Prepared by MigrateMate</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ color: '#22c55e', fontSize: '14pt', fontWeight: 'bold' }}>{formData.origin} to {formData.destination}</div>
                                <p style={{ color: '#6b7280' }}>Budget: ${formData.budget}</p>
                            </div>
                        </div>

                        <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '16pt', fontWeight: 'bold', color: '#15803d', marginBottom: '10px' }}>Summary</h2>
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
                        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                                <h3 className="text-2xl font-bold mb-6 text-gray-900">Name Your Plan</h3>
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Plan Name</label>
                                    <input
                                        type="text"
                                        value={planName}
                                        onChange={(e) => setPlanName(e.target.value)}
                                        placeholder="e.g. My London Journey"
                                        className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setShowSaveModal(false)} className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-colors">Cancel</button>
                                    <button onClick={handleSavePlan} disabled={!planName.trim()} className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 transition-colors shadow-lg shadow-green-200">Save Plan</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* My Plans Modal */}
                <AnimatePresence>
                    {showMyPlans && (
                        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                                className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col border border-gray-100">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                    <h3 className="text-2xl font-bold text-gray-900">My Saved Plans</h3>
                                    <button onClick={() => setShowMyPlans(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
                                </div>

                                <div className="overflow-y-auto p-8 flex-1 bg-gray-50">
                                    {savedPlans.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                            <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                                                <FileText className="w-12 h-12 text-gray-300" />
                                            </div>
                                            <p className="text-xl font-bold text-gray-500">No saved plans yet</p>
                                            <p className="text-sm mt-1">Create a new plan to get started.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {savedPlans.map((p) => (
                                                <div key={p.id} onClick={() => loadSavedPlan(p)} className="group bg-white border border-gray-100 rounded-2xl p-6 hover:border-green-500 hover:shadow-xl cursor-pointer transition-all duration-300 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                                                    <div className="relative z-10">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <h4 className="font-bold text-gray-900 text-lg group-hover:text-green-700 transition-colors line-clamp-1">{p.planName}</h4>
                                                            <button
                                                                onClick={(e) => handleDeletePlan(e, p.id)}
                                                                className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                                                title="Delete Plan"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-xl">
                                                            <span className="font-semibold text-gray-700">{p.origin}</span>
                                                            <ArrowRight className="w-4 h-4 mx-2 text-gray-400" />
                                                            <span className="font-semibold text-gray-700">{p.destination}</span>
                                                        </div>

                                                        <div className="flex justify-between items-center text-xs font-medium text-gray-400">
                                                            <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-md">
                                                                <DollarSign className="w-3 h-3" /> {p.budget.toLocaleString()}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" /> {new Date(p.createdAt).toLocaleDateString()}
                                                            </span>
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
            </main>
            <Footer />
        </div>
    );
};

export default JourneyPlanner;
