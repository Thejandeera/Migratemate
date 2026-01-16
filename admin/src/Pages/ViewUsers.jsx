import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthData } from '../utils/auth';

// Enhanced ZoomableImage with better responsive behavior
const ZoomableImage = ({ src, alt, className }) => {
    const [isHovered, setIsHovered] = useState(false);

    if (!src) return (
        <div className={`bg-gray-100 flex items-center justify-center text-gray-400 text-xs ${className}`}>
            No Image
        </div>
    );

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setTimeout(() => setIsHovered(false), 2000)}
        >
            <img
                src={src}
                alt={alt}
                className={`${className} object-cover cursor-pointer transition-all duration-300 ${isHovered ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}
            />
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
                        maxWidth: 'min(90vw, 600px)',
                        maxHeight: 'min(90vh, 600px)',
                    }}
                >
                    <img
                        src={src}
                        alt={alt}
                        className="w-auto h-auto max-w-full max-h-full object-contain rounded-xl shadow-2xl bg-white border-4 border-white"
                    />
                </motion.div>
            )}
        </div>
    );
};

const ViewUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [verifyingId, setVerifyingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

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

        return matchesSearch && matchesRole;
    });

    const handleViewProfile = (user) => {
        setSelectedUser(user);
        setShowDocumentModal(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser({ ...user });
        setShowEditModal(true);
    };

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

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${selectedUser.id}/admin-update`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({
                    firstName: selectedUser.firstName,
                    lastName: selectedUser.lastName,
                    email: selectedUser.email,
                    phone: selectedUser.phone,
                    location: selectedUser.location,
                    bio: selectedUser.bio,
                    countryOfOrigin: selectedUser.countryOfOrigin,
                    destinationCountry: selectedUser.destinationCountry
                })
            });
            const data = await response.json();
            if (data.success) {
                setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...data.data } : u));
                setShowEditModal(false);
                showNotification('User updated successfully', 'success');
            } else {
                showNotification(data.message || 'Update failed', 'error');
            }
        } catch (err) {
            console.error(err);
            showNotification('Failed to update user', 'error');
        }
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Notification */}
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className={`fixed top-20 right-4 left-4 md:left-auto md:right-6 p-4 rounded-xl shadow-2xl z-[200] text-white backdrop-blur-sm ${notification.type === 'success'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                            : 'bg-gradient-to-r from-red-500 to-pink-600'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span>{notification.message}</span>
                            <button
                                onClick={() => setNotification({ show: false, message: '', type: '' })}
                                className="ml-4 text-white/80 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto py-6 px-3 sm:px-4 lg:px-6 pt-24">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                User Management
                            </h1>
                            <p className="text-gray-600">
                                Manage and monitor all registered users
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={fetchUsers}
                                className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium text-sm flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search users by name, email, or phone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                    className="px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="helper">Helpers</option>
                                    <option value="user">Users</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mb-4"></div>
                        <p className="text-gray-600">Loading users...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <span>User</span>
                                            </div>
                                        </th>
                                        <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-12 w-12">
                                                        <ZoomableImage
                                                            src={user.avatarUrl}
                                                            alt="Avatar"
                                                            className="h-12 w-12 rounded-full border-2 border-white shadow"
                                                        />
                                                    </div>
                                                    <div className="ml-3 sm:ml-4">
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {user.fullName || 'No Name'}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Joined {new Date(user.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{user.email}</div>
                                                <div className="text-xs text-gray-500">{user.phone || 'No phone'}</div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isVerified
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'}`}>
                                                    {user.isVerified ? (
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            Verified
                                                        </span>
                                                    ) : 'Unverified'}
                                                </span>
                                            </td>
                                            <td className="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${user.isHelper
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-blue-100 text-blue-800'}`}>
                                                        {user.isHelper ? 'Helper' : 'User'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end flex-wrap gap-2">
                                                    <button
                                                        onClick={() => handleViewProfile(user)}
                                                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                        title="View Profile"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditUser(user)}
                                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Edit User"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleVerification(user)}
                                                        disabled={verifyingId === user.id}
                                                        className={`p-2 rounded-lg transition-all ${user.isVerified
                                                            ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                                                            : 'text-green-600 hover:text-green-700 hover:bg-green-50'} ${verifyingId === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        title={user.isVerified ? 'Revoke Verification' : 'Verify User'}
                                                    >
                                                        {verifyingId === user.id ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                                                        ) : user.isVerified ? (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        disabled={deletingId === user.id}
                                                        className={`p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all ${deletingId === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        title="Delete User"
                                                    >
                                                        {deletingId === user.id ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredUsers.length === 0 && (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="mt-4 text-gray-500">
                                        {searchTerm || filterRole !== 'all'
                                            ? 'No users match your search criteria'
                                            : 'No users found'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Profile View Modal */}
                <AnimatePresence>
                    {showDocumentModal && selectedUser && (
                        <div className="fixed inset-0 z-[100] overflow-y-auto" onClick={() => setShowDocumentModal(false)}>
                            <div className="flex items-center justify-center min-h-screen px-3 sm:px-4 py-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                                />
                                <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-block w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden relative"
                                >
                                    <div className="p-4 sm:p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                                                User Profile & Documents
                                            </h3>
                                            <button
                                                onClick={() => setShowDocumentModal(false)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                                            {/* Profile Section */}
                                            <div className="space-y-6">
                                                <div className="flex flex-col items-center">
                                                    <ZoomableImage
                                                        src={selectedUser.avatarUrl}
                                                        alt="Avatar"
                                                        className="h-40 w-40 rounded-full border-4 border-white shadow-xl"
                                                    />
                                                    <h4 className="mt-4 text-lg font-semibold text-gray-900">
                                                        {selectedUser.fullName}
                                                    </h4>
                                                    <p className="text-gray-600">{selectedUser.email}</p>
                                                </div>

                                                <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                                                    <h4 className="font-semibold text-gray-900 mb-4 text-lg">
                                                        Profile Details
                                                    </h4>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                            </svg>
                                                            <span className="text-gray-700">
                                                                {selectedUser.phone || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <span className="text-gray-700">
                                                                {selectedUser.location || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span className="text-gray-700">
                                                                {selectedUser.countryOfOrigin || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <h5 className="font-medium text-gray-900 mb-2">Bio</h5>
                                                        <p className="text-gray-600 bg-white p-3 rounded-lg border border-gray-100">
                                                            {selectedUser.bio || 'No bio provided'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Documents Section */}
                                            <div className="space-y-6">
                                                <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                                                    <h4 className="font-semibold text-gray-900 mb-4 text-lg">
                                                        Verification Documents
                                                    </h4>
                                                    <div className="space-y-6">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700 mb-3">
                                                                Passport / ID Document
                                                            </p>
                                                            <div className="h-48 w-full rounded-xl overflow-hidden border-2 border-gray-200">
                                                                {selectedUser.passportImageUrl ? (
                                                                    <ZoomableImage
                                                                        src={selectedUser.passportImageUrl}
                                                                        alt="Passport"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                                                                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                        No Document Uploaded
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700 mb-3">
                                                                Selfie Verification
                                                            </p>
                                                            <div className="h-48 w-full rounded-xl overflow-hidden border-2 border-gray-200">
                                                                {selectedUser.selfieImageUrl ? (
                                                                    <ZoomableImage
                                                                        src={selectedUser.selfieImageUrl}
                                                                        alt="Selfie"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                                                                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        No Selfie Uploaded
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Edit Modal */}
                <AnimatePresence>
                    {showEditModal && selectedUser && (
                        <div className="fixed inset-0 z-[100] overflow-y-auto" onClick={() => setShowEditModal(false)}>
                            <div className="flex items-center justify-center min-h-screen px-3 sm:px-4 py-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-block w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden relative"
                                >
                                    <form onSubmit={handleUpdateUser}>
                                        <div className="p-4 sm:p-6">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    Edit User Details
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowEditModal(false)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        First Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={selectedUser.firstName || ''}
                                                        onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Last Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={selectedUser.lastName || ''}
                                                        onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Phone
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={selectedUser.phone || ''}
                                                        onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Location
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={selectedUser.location || ''}
                                                        onChange={(e) => setSelectedUser({ ...selectedUser, location: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Bio
                                                    </label>
                                                    <textarea
                                                        value={selectedUser.bio || ''}
                                                        onChange={(e) => setSelectedUser({ ...selectedUser, bio: e.target.value })}
                                                        rows="3"
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Country of Origin
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={selectedUser.countryOfOrigin || ''}
                                                        onChange={(e) => setSelectedUser({ ...selectedUser, countryOfOrigin: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Destination Country
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={selectedUser.destinationCountry || ''}
                                                        onChange={(e) => setSelectedUser({ ...selectedUser, destinationCountry: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row-reverse gap-3">
                                            <button
                                                type="submit"
                                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium text-sm w-full sm:w-auto"
                                            >
                                                Save Changes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowEditModal(false)}
                                                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium text-sm w-full sm:w-auto"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ViewUsers;