import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthData } from '../utils/auth';

// Component for Hover Zoom Effect
const ZoomableImage = ({ src, alt, className }) => {
    const [isHovered, setIsHovered] = useState(false);

    // If no src, return placeholder
    if (!src) return <div className={`bg-gray-200 flex items-center justify-center text-gray-400 text-xs ${className}`}>No Image</div>;

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <img
                src={src}
                alt={alt}
                className={`${className} object-cover cursor-pointer transition-opacity duration-200 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
            />

            {/* For table "undock" feel, maybe absolute is better but fixed ensures it escapes overflow:hidden of table */}
            {isHovered && (
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="fixed z-[9999]"
                    style={{
                        top: '50%',
                        left: '50%',
                        x: '-50%',
                        y: '-50%',
                        width: 'auto',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        pointerEvents: 'none'
                    }}
                >
                    <img src={src} alt={alt} className="max-w-[500px] max-h-[500px] object-contain rounded-lg shadow-2xl bg-white border-4 border-white" />
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
    const [verifyingId, setVerifyingId] = useState(null); // Track which user is being verified
    const [deletingId, setDeletingId] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Helper to get token
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
            // Note: Updated to backend endpoint for all users
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

    const handleViewProfile = (user) => {
        setSelectedUser(user);
        setShowDocumentModal(true);
    };

    const handleEditUser = (user) => {
        // Create a copy to allow editing without mutating list immediately
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
            // Note: Ensure the current status is correctly inverted
            const newStatus = !user.isVerified;
            console.log(`Toggling verification for ${user.email} from ${user.isVerified} to ${newStatus}`);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}/verify?isVerified=${newStatus}`, {
                method: 'PATCH',
                headers: getHeaders()
            });

            // Check if response is ok before parsing JSON to catch non-JSON errors (like 404 HTML pages)
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
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
                <div className="px-4 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <button onClick={fetchUsers} className="text-green-600 hover:text-green-700 font-medium text-sm">
                            Refresh List
                        </button>
                    </div>

                    {notification.show && (
                        <div className={`fixed top-24 right-4 p-4 rounded-lg shadow-lg z-[200] text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                            {notification.message}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                            {error}
                        </div>
                    ) : (
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <ZoomableImage src={user.avatarUrl} alt="Avatar" className="h-10 w-10 rounded-full" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{user.fullName || 'No Name'}</div>
                                                            <div className="text-sm text-gray-500">Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{user.email}</div>
                                                    <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {user.isVerified ? 'Verified' : 'Unverified'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.isHelper ? 'Helper' : 'User'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                    <button onClick={() => handleViewProfile(user)} className="text-indigo-600 hover:text-indigo-900">View</button>
                                                    <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                                    <button
                                                        onClick={() => handleToggleVerification(user)}
                                                        disabled={verifyingId === user.id}
                                                        className={`${user.isVerified ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'} ${verifyingId === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {verifyingId === user.id ? '...' : (user.isVerified ? 'Revoke' : 'Verify')}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        disabled={deletingId === user.id}
                                                        className={`text-red-600 hover:text-red-900 ${deletingId === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {deletingId === user.id ? '...' : 'Delete'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Document/Profile View Modal */}
                <AnimatePresence>
                    {showDocumentModal && selectedUser && (
                        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDocumentModal(false)}></div>
                                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full relative"
                                >
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">
                                            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                                    User Profile & Documents
                                                </h3>
                                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <div className="flex justify-center mb-6">
                                                            <ZoomableImage src={selectedUser.avatarUrl} alt="Avatar" className="h-32 w-32 rounded-full border-4 border-gray-100 shadow-sm" />
                                                        </div>
                                                        <h4 className="font-semibold text-gray-700 mb-2">Profile Details</h4>
                                                        <p><strong>Name:</strong> {selectedUser.fullName}</p>
                                                        <p><strong>Email:</strong> {selectedUser.email}</p>
                                                        <p><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</p>
                                                        <p><strong>Location:</strong> {selectedUser.location || 'N/A'}</p>
                                                        <p><strong>Country:</strong> {selectedUser.countryOfOrigin || 'N/A'}</p>
                                                        <p><strong>Destination:</strong> {selectedUser.destinationCountry || 'N/A'}</p>
                                                        <p><strong>Bio:</strong> {selectedUser.bio || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-700 mb-2">Documents</h4>
                                                        <div className="space-y-4">
                                                            <div>
                                                                <p className="text-sm text-gray-500 mb-1">Passport/ID</p>
                                                                <div className="h-40 w-full relative">
                                                                    {selectedUser.passportImageUrl ? (
                                                                        <ZoomableImage src={selectedUser.passportImageUrl} alt="Passport" className="w-full h-40 object-cover rounded border shadow-sm" />
                                                                    ) : (
                                                                        <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded border text-gray-400">No Document</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500 mb-1">Selfie Verification</p>
                                                                <div className="h-40 w-full relative">
                                                                    {selectedUser.selfieImageUrl ? (
                                                                        <ZoomableImage src={selectedUser.selfieImageUrl} alt="Selfie" className="w-full h-40 object-cover rounded border shadow-sm" />
                                                                    ) : (
                                                                        <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded border text-gray-400">No Selfie</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={() => setShowDocumentModal(false)}>
                                            Close
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Edit Modal content remains the same, just keeping structure */}
                <AnimatePresence>
                    {showEditModal && selectedUser && (
                        <div className="fixed inset-0 z-[100] overflow-y-auto" role="dialog" aria-modal="true">
                            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEditModal(false)}></div>
                                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full relative"
                                >
                                    <form onSubmit={handleUpdateUser}>
                                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Edit User Details</h3>
                                            <div className="grid grid-cols-1 gap-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                                                        <input
                                                            type="text"
                                                            value={selectedUser.firstName || ''}
                                                            onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                                        <input
                                                            type="text"
                                                            value={selectedUser.lastName || ''}
                                                            onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                                    <input
                                                        type="text"
                                                        value={selectedUser.phone || ''}
                                                        onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Location</label>
                                                    <input
                                                        type="text"
                                                        value={selectedUser.location || ''}
                                                        onChange={(e) => setSelectedUser({ ...selectedUser, location: e.target.value })}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                                                    <textarea
                                                        value={selectedUser.bio || ''}
                                                        onChange={(e) => setSelectedUser({ ...selectedUser, bio: e.target.value })}
                                                        rows="3"
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                    ></textarea>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Country of Origin</label>
                                                    <input
                                                        type="text"
                                                        value={selectedUser.countryOfOrigin || ''}
                                                        onChange={(e) => setSelectedUser({ ...selectedUser, countryOfOrigin: e.target.value })}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Destination Country</label>
                                                    <input
                                                        type="text"
                                                        value={selectedUser.destinationCountry || ''}
                                                        onChange={(e) => setSelectedUser({ ...selectedUser, destinationCountry: e.target.value })}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                            <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                                                Save Changes
                                            </button>
                                            <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={() => setShowEditModal(false)}>
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
