import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthData } from '../utils/auth';
import {
    ArrowRight,
    MapPin,
    DollarSign,
    Calendar,
    Eye,
    FileText,
    User,
    Search,
    RefreshCw,
    X,
    TrendingUp,
    Globe
} from 'lucide-react';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const getHeaders = () => {
        const auth = getAuthData();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.token}`
        };
    };

    const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/journey/all`, {
                headers: getHeaders()
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                setReports(data);
            } else {
                setError("Failed to fetch reports: Invalid data format");
            }
        } catch (err) {
            setError('Failed to fetch reports. Ensure server is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const filteredReports = reports.filter(report => {
        const term = searchTerm.toLowerCase();
        return (
            report.planName?.toLowerCase().includes(term) ||
            report.origin?.toLowerCase().includes(term) ||
            report.destination?.toLowerCase().includes(term) ||
            report.userId?.toLowerCase().includes(term)
        );
    });

    const handleViewReport = (report) => {
        setSelectedReport(report);
        setShowDetailModal(true);
    };

    return (
        <div className="min-h-screen font-sans text-gray-900 bg-gray-50/30">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Journey Reports</h1>
                        <p className="text-gray-500">Analyze user migration plans and trends.</p>
                    </div>
                    <button
                        onClick={fetchReports}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 hover:text-green-600 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all font-medium"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        <span>Refresh List</span>
                    </button>
                </div>

                {/* Stats Summary - Optional quick stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <FileText size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{reports.length}</div>
                            <div className="text-xs font-bold text-gray-400 uppercase">Total Reports</div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-2 mb-8 sticky top-24 z-30">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by plan name, origin, destination, or user ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-0 focus:bg-gray-100 transition-all text-gray-900 placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading reports...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-3xl text-center border border-red-100">
                        <p className="font-medium">{error}</p>
                        <button onClick={fetchReports} className="mt-4 text-sm underline hover:text-red-700">Try Again</button>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full whitespace-nowrap">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Plan Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Route</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Budget</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredReports.map((report) => (
                                        <motion.tr
                                            key={report.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="group hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                                        <TrendingUp size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                                            {report.planName}
                                                        </div>
                                                        <div className="text-xs text-gray-400 font-mono">
                                                            ID: {report.id?.substring(0, 8)}...
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium bg-gray-50 px-3 py-1.5 rounded-lg w-fit border border-gray-100">
                                                    <span className="truncate max-w-[80px]">{report.origin}</span>
                                                    <ArrowRight size={14} className="text-gray-400" />
                                                    <span className="truncate max-w-[80px]">{report.destination}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                                                    <div className="p-1 bg-green-100 text-green-600 rounded-md">
                                                        <DollarSign size={12} strokeWidth={3} />
                                                    </div>
                                                    {report.budget?.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200">
                                                        <User size={14} />
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-mono bg-gray-50 px-1.5 py-0.5 rounded">
                                                        {report.userId?.substring(0, 8)}...
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <Calendar size={14} />
                                                    {new Date(report.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleViewReport(report)}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                                                    title="View Full Report"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                    {filteredReports.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-4 bg-gray-50 rounded-full">
                                                        <FileText size={24} />
                                                    </div>
                                                    <p>No reports found matching your criteria.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal - Full Screen Slide/Fade */}
            <AnimatePresence>
                {showDetailModal && selectedReport && (
                    <div className="fixed inset-0 z-[100] overflow-hidden" onClick={() => setShowDetailModal(false)}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />

                        <div className="absolute inset-y-0 right-0 w-full max-w-2xl flex pointer-events-none">
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full h-full bg-white shadow-2xl pointer-events-auto flex flex-col"
                            >
                                {/* Modal Header */}
                                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{selectedReport.planName}</h2>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <Calendar size={14} />
                                            {new Date(selectedReport.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-700"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Modal Content - Scrollable */}
                                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                                    {/* Key Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                                    <Globe size={16} />
                                                </div>
                                                <span className="text-xs font-bold text-gray-400 uppercase">Route</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="font-bold text-gray-900">{selectedReport.origin}</div>
                                                <ArrowRight size={14} className="text-gray-400 rotate-90 md:rotate-0 self-start" />
                                                <div className="font-bold text-gray-900">{selectedReport.destination}</div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="p-1.5 bg-green-50 text-green-600 rounded-lg">
                                                    <DollarSign size={16} />
                                                </div>
                                                <span className="text-xs font-bold text-gray-400 uppercase">Budget</span>
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900 tracking-tight">
                                                ${selectedReport.budget?.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <FileText size={20} className="text-blue-500" />
                                            Executive Summary
                                        </h3>
                                        <div className="text-gray-600 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-sm">
                                            {selectedReport.summary}
                                        </div>
                                    </div>

                                    {/* Phases Timeline */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <TrendingUp size={20} className="text-purple-500" />
                                            Migration Phases
                                        </h3>
                                        <div className="relative pl-4 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-200">
                                            {selectedReport.phases?.map((phase, idx) => (
                                                <div key={idx} className="relative pl-8">
                                                    <div className="absolute left-0 top-0 w-10 h-10 bg-white border-4 border-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 shadow-sm z-10 text-sm">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                                        <h4 className="font-bold text-gray-900 text-lg mb-3">{phase.phaseName}</h4>
                                                        <div className="prose prose-sm max-w-none text-gray-600 bg-gray-50 p-4 rounded-xl">
                                                            <p className="whitespace-pre-line leading-relaxed">{phase.aiAdvice}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Reports;
