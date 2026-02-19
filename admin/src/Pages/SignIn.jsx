import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuthData } from '../utils/auth';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import migrateIcon from '../assets/migrate-icon.png';

const SignIn = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                setAuthData({
                    token: data.data.token,
                    refreshToken: data.data.refreshToken,
                    id: data.data.admin.id
                }, true);
                navigate('/users');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login Error:', err);
            setError('An error occurred during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#1a3a1d]/5 to-transparent"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#1a3a1d]/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-md w-full space-y-8 relative">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center mb-6">
                        <img
                            src={migrateIcon}
                            alt="MigrateMate"
                            className="w-16 h-16 object-contain"
                        />
                    </div>
                    <h2 className="text-4xl font-light text-neural-dark tracking-tighter mb-2">
                        Welcome <span className="font-normal">Back</span>
                    </h2>
                    <p className="text-gray-500 text-lg font-light">
                        Sign in to access the Admin Console
                    </p>
                </div>

                <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 p-8 md:p-10 border border-white/50 backdrop-blur-xl">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-xs font-bold text-gray-400 mb-2 ml-1 uppercase tracking-wider">
                                    Email address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-deep-green transition-colors" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1a3a1d]/20 focus:border-[#1a3a1d] transition-all font-medium"
                                        placeholder="admin@migratemate.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-xs font-bold text-gray-400 mb-2 ml-1 uppercase tracking-wider">
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-deep-green transition-colors" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1a3a1d]/20 focus:border-[#1a3a1d] transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl text-base font-semibold text-white transition-all duration-300 shadow-lg ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-neural-dark hover:bg-neural-dark/90 hover:shadow-xl hover:-translate-y-0.5'
                                    }`}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Authenticating...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Sign in to Dashboard
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-400 font-light">
                    &copy; {new Date().getFullYear()} MigrateMate Admin Console
                </p>
            </div>
        </div>
    );
};

export default SignIn;
