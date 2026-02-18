import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthData } from '../utils/auth';
import {
    Search,
    Filter,
    RefreshCw,
    Eye,
    Edit2,
    Trash2,
    CheckCircle,
    XCircle,
    User,
    Shield,
    Phone,
    Mail,
    MapPin,
    ArrowRight
} from 'lucide-react';

// Enhanced ZoomableImage with better responsive behavior
const ZoomableImage = ({ src, alt, className }) => {
    const [isHovered, setIsHovered] = useState(false);

    if (!src) return (
        <div className={`bg-gray-50 flex items-center justify-center text-gray-400 text-xs ${className} rounded-full border border-gray-100`}>
            <User size={16} />
        </div>
    );

    return (
        <div
            className="relative z-10"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setTimeout(() => setIsHovered(false), 2000)}
        >
            <img
                src={src}
                alt={alt}
                className={`${className} object-cover cursor-pointer transition-all duration-300 ${isHovered ? 'scale-110 shadow-lg ring-2 ring-offset-2 ring-blue-500' : 'scale-100'}`}
            />
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="fixed z-[9999] pointer-events-none"
                        style={{
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 'auto',
                            maxWidth: 'min(90vw, 400px)',
                        }}
                    >
                        <img
                            src={src}
                            alt={alt}
                            className="w-full h-auto rounded-2xl shadow-2xl bg-white p-2"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ViewUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [verifyingId, setVerifyingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterVerification, setFilterVerification] = useState('all');

    const getHeaders = () => {
        const auth = getAuthData();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.token}`
        };
    };

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/all`, {
                headers: getHeaders()
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.data);
            } else {
                setError(data.message || "Failed to fetch users");
            }
        } catch (err) {
            setError('Failed to fetch users. Ensure you are logged in and the server is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesSearch = searchTerm === '' ||
            user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = filterRole === 'all' ||
            (filterRole === 'helper' && user.isHelper) ||
            (filterRole === 'user' && !user.isHelper);

        const matchesVerification = filterVerification === 'all' ||
            (filterVerification === 'verified' && user.isVerified) ||
            (filterVerification === 'unverified' && !user.isVerified);

        return matchesSearch && matchesRole && matchesVerification;
    });

    const navigate = useNavigate();

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        setDeletingId(userId);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            const data = await response.json();
            if (data.success) {
                setUsers(users.filter(u => u.id !== userId));
                showNotification('User deleted successfully', 'success');
            } else {
                showNotification(data.message || 'Delete failed', 'error');
            }
        } catch (err) {
            console.error(err);
            showNotification('Failed to delete user', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggleVerification = async (user) => {
        if (verifyingId) return;
        setVerifyingId(user.id);
        try {
            const newStatus = !user.isVerified;
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}/verify?isVerified=${newStatus}`, {
                method: 'PATCH',
                headers: getHeaders()
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Server responded with ${response.status}: ${text}`);
            }

            const data = await response.json();
            if (data.success) {
                setUsers(users.map(u => u.id === user.id ? { ...u, isVerified: newStatus } : u));
                showNotification(`User ${newStatus ? 'verified' : 'unverified'} successfully`, 'success');
            } else {
                showNotification(data.message || 'Action failed', 'error');
            }
        } catch (err) {
            console.error('Verification Error:', err);
            showNotification(`Failed to update status: ${err.message}`, 'error');
        } finally {
            setVerifyingId(null);
        }
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    return (
        <div className="min-h-screen font-sans text-gray-900 bg-gray-50/30">
            <Navbar />

            {/* Notification */}
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className={`fixed top-24 right-4 z-[200] max-w-sm w-full p-4 rounded-2xl shadow-2xl backdrop-blur-md border border-white/20 ${notification.type === 'success'
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-red-500/90 text-white'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-medium">{notification.message}</span>
                            <button onClick={() => setNotification({ show: false, message: '', type: '' })} className="ml-4 text-white/80 hover:text-white transition-colors">✕</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
                        <p className="text-gray-500">Overview and control of all registered users on MigrateMate.</p>
                    </div>
                    <button
                        onClick={fetchUsers}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 hover:text-blue-600 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all font-medium"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        <span>Refresh List</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-2 mb-8 sticky top-24 z-30">
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-0 focus:bg-gray-100 transition-all text-gray-900 placeholder-gray-400"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                            <div className="relative min-w-[140px]">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                    className="w-full pl-10 pr-8 py-3 bg-gray-50 border-none rounded-2xl focus:ring-0 focus:bg-gray-100 transition-all text-gray-900 appearance-none cursor-pointer text-sm font-medium"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="helper">Service Providers</option>
                                    <option value="user">Regular Users</option>
                                </select>
                            </div>
                            <div className="relative min-w-[140px]">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <select
                                    value={filterVerification}
                                    onChange={(e) => setFilterVerification(e.target.value)}
                                    className="w-full pl-10 pr-8 py-3 bg-gray-50 border-none rounded-2xl focus:ring-0 focus:bg-gray-100 transition-all text-gray-900 appearance-none cursor-pointer text-sm font-medium"
                                >
                                    <option value="all">Any Status</option>
                                    <option value="verified">Verified Only</option>
                                    <option value="unverified">Unverified</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading users...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-3xl text-center border border-red-100">
                        <p className="font-medium">{error}</p>
                        <button onClick={fetchUsers} className="mt-4 text-sm underline hover:text-red-700">Try Again</button>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-left">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User Profile</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Details & Route</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role & Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.map((user) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="group hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <ZoomableImage
                                                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`}
                                                        alt={user.fullName}
                                                        className="w-12 h-12 rounded-full ring-4 ring-white shadow-sm"
                                                    />
                                                    <div>
                                                        <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-base">{user.fullName}</div>
                                                        <div className="text-xs text-gray-400">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail size={14} className="text-gray-400" />
                                                        {user.email}
                                                    </div>
                                                    {user.phone && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Phone size={14} className="text-gray-400" />
                                                            {user.phone}
                                                        </div>
                                                    )}
                                                    {(user.origin || user.destination) && (
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 bg-gray-50 px-2 py-1 rounded-lg w-fit border border-gray-100">
                                                            <MapPin size={12} className="text-blue-400" />
                                                            <span>{user.origin || 'Unknown'}</span>
                                                            <ArrowRight size={10} className="text-gray-300" />
                                                            <span>{user.destination || 'Unknown'}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-2 items-start">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${user.isHelper
                                                        ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200'
                                                        : 'bg-blue-100 text-blue-700 ring-1 ring-blue-200'
                                                        }`}>
                                                        {user.isHelper ? <Shield size={12} fill="currentColor" className="opacity-20" /> : <User size={12} fill="currentColor" className="opacity-20" />}
                                                        {user.isHelper ? 'Service Provider' : 'User'}
                                                    </span>

                                                    <div className="flex items-center gap-2">
                                                        {user.isVerified ? (
                                                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                                                <CheckCircle size={10} /> Verified
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                                                                <XCircle size={10} /> Unverified
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/users/${user.id}`)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                        title="View Profile"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/users/${user.id}/edit`)}
                                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                        title="Edit User"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleVerification(user)}
                                                        className={`p-2 rounded-xl transition-all ${user.isVerified
                                                            ? 'text-emerald-600 hover:text-red-600 hover:bg-red-50'
                                                            : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                            }`}
                                                        title={user.isVerified ? "Revoke Verification" : "Verify User"}
                                                    >
                                                        {verifyingId === user.id ? (
                                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <CheckCircle size={18} />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Delete User"
                                                    >
                                                        {deletingId === user.id ? (
                                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <Trash2 size={18} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-4 bg-gray-50 rounded-full">
                                                        <Search size={24} />
                                                    </div>
                                                    <p>No users found matching your criteria.</p>
                                                    <button onClick={() => { setSearchTerm(''); setFilterRole('all'); setFilterVerification('all'); }} className="text-blue-600 hover:underline text-sm font-medium">Clear all filters</button>
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
        </div>
    );
};

export default ViewUsers;