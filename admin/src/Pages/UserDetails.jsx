import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getAuthData } from '../utils/auth';
import { ArrowLeft, Mail, Phone, MapPin, Globe, CheckCircle, XCircle } from 'lucide-react';

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
                    headers: { 'Authorization': `Bearer ${getAuthData()?.token}` }
                });
                const data = await response.json();
                if (data.success) {
                    setUser(data.data);
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError('Failed to fetch user details');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
    if (!user) return <div className="min-h-screen flex items-center justify-center">User not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />
            <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 pt-24">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors">
                    <ArrowLeft size={20} className="mr-2" /> Back
                </button>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    {/* Header / Cover */}
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="flex items-end">
                                <img
                                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.fullName}`}
                                    alt=""
                                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                                />
                                <div className="ml-6 mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900">{user.fullName}</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${user.isHelper ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {user.isHelper ? 'Helper' : 'User'}
                                        </span>
                                        {user.isVerified && (
                                            <span className="flex items-center text-green-600 text-xs font-bold uppercase bg-green-50 px-2 py-0.5 rounded">
                                                <CheckCircle size={12} className="mr-1" /> Verified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-8">
                                <section>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">About</h2>
                                    <div className="bg-gray-50 rounded-xl p-6 text-gray-700 leading-relaxed">
                                        {user.bio || "No bio provided."}
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Documents</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                                            <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Passport / ID</p>
                                            <div className="h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                                {user.passportImageUrl ? (
                                                    <img src={user.passportImageUrl} alt="Passport" className="h-full w-full object-cover" />
                                                ) : <span className="text-gray-400 text-sm">No Document</span>}
                                            </div>
                                        </div>
                                        <div className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                                            <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Selfie</p>
                                            <div className="h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                                {user.selfieImageUrl ? (
                                                    <img src={user.selfieImageUrl} alt="Selfie" className="h-full w-full object-cover" />
                                                ) : <span className="text-gray-400 text-sm">No Selfie</span>}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-6">
                                <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                    <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Info</h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center text-gray-600">
                                            <Mail size={18} className="mr-3 text-gray-400" />
                                            <span className="text-sm">{user.email}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <Phone size={18} className="mr-3 text-gray-400" />
                                            <span className="text-sm">{user.phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <MapPin size={18} className="mr-3 text-gray-400" />
                                            <span className="text-sm">{user.location || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <Globe size={18} className="mr-3 text-gray-400" />
                                            <span className="text-sm">{user.countryOfOrigin} &rarr; {user.destinationCountry}</span>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-gray-900 text-white rounded-xl p-6">
                                    <h2 className="font-bold mb-4 opacity-90">Quick Admin Actions</h2>
                                    <div className="space-y-2">
                                        <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
                                            Reset Password
                                        </button>
                                        <button className="w-full py-2 bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-lg text-sm transition-colors">
                                            Suspend Account
                                        </button>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetails;
