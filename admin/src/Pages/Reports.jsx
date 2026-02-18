import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthData } from '../utils/auth';
import { ArrowRight, MapPin, DollarSign, Calendar, Eye, FileText, User } from 'lucide-react'; // Assuming you have lucide-react, otherwise use SVGs

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
            // API returns list directly based on Controller
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
        <div className="min-h-screen font-sans text-gray-900">
            <Navbar />

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-24">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                Journey Reports
                            </h1>
                            <p className="text-gray-600">
                                View and analyze user-generated migration plans.
                            </p>
                        </div>
                        <button
                            onClick={fetchReports}
                            className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium text-sm flex items-center gap-2 self-start md:self-auto"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>

                    {/* Search */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by plan name, origin, destination, or user ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mb-4"></div>
                        <p className="text-gray-600">Loading reports...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 flex items-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Route</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Budget</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredReports.map((report) => (
                                        <motion.tr
                                            key={report.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{report.planName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <span>{report.origin}</span>
                                                    <ArrowRight size={14} className="mx-2 text-gray-400" />
                                                    <span>{report.destination}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    ${report.budget?.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-xs text-gray-500 bg-gray-100 rounded px-2 py-1 w-fit">
                                                    <User size={12} className="mr-1" />
                                                    {report.userId?.substring(0, 8)}...
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleViewReport(report)}
                                                    className="text-gray-400 hover:text-green-600 transition-colors p-2 rounded-full hover:bg-green-50"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredReports.length === 0 && (
                                <div className="text-center py-12">
                                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">No reports found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Detail Modal */}
                <AnimatePresence>
                    {showDetailModal && selectedReport && (
                        <div className="fixed inset-0 z-[100] overflow-y-auto" onClick={() => setShowDetailModal(false)}>
                            <div className="flex items-center justify-center min-h-screen px-4 py-6">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                                >
                                    <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{selectedReport.planName}</h3>
                                            <p className="text-sm text-gray-500">
                                                Generated on {new Date(selectedReport.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>

                                    <div className="p-6 overflow-y-auto bg-gray-50/30">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Route</p>
                                                <div className="flex items-center font-semibold text-gray-800">
                                                    {selectedReport.origin} <ArrowRight size={16} className="mx-2 text-green-500" /> {selectedReport.destination}
                                                </div>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Budget</p>
                                                <div className="flex items-center font-semibold text-green-600">
                                                    ${selectedReport.budget?.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">User</p>
                                                <div className="text-sm font-medium text-gray-700 truncate" title={selectedReport.userId}>
                                                    {selectedReport.userId}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                                                <h4 className="font-bold text-green-800 mb-2">Summary</h4>
                                                <p className="text-green-700 leading-relaxed">{selectedReport.summary}</p>
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-4 text-lg">Phases</h4>
                                                <div className="space-y-4">
                                                    {selectedReport.phases?.map((phase, idx) => (
                                                        <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                                            <div className="flex items-start gap-4">
                                                                <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                                                    {idx + 1}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h5 className="font-bold text-gray-800 text-lg mb-2">{phase.phaseName}</h5>
                                                                    <div className="prose prose-sm max-w-none text-gray-600">
                                                                        <p className="whitespace-pre-line">{phase.aiAdvice}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Reports;
