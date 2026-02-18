import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { setAuthData, setUserData } from '../utils/auth';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Github } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const fetchUserProfile = async (token, refreshToken) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-refresh-token': refreshToken
                }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                return data.data;
            } else {
                throw new Error(data.message || 'Failed to fetch profile');
            }
        } catch (err) {
            console.error("Profile fetch error:", err);
            throw err;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const { token, refreshToken, user } = data.data;

                setAuthData({
                    token,
                    refreshToken,
                    id: user ? user.id : null
                }, rememberMe);

                let profileData = user;
                try {
                    profileData = await fetchUserProfile(token, refreshToken);
                } catch (profileErr) {
                    console.warn("Could not fetch full profile, using login data", profileErr);
                }

                setUserData(profileData);
                navigate('/dashboard');
            } else {
                setError(data.message || 'Invalid email or password');
            }
        } catch (err) {
            console.error(err);
            setError('Unable to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col">
            <Navbar />

            <div className="flex-1 flex pt-16">
                {/* Left Side - Form */}
                <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-md w-full space-y-8"
                    >
                        <div>
                            <div className="h-14 w-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                            </div>
                            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
                            <p className="mt-3 text-lg text-gray-500">
                                Sign in to manage your journey and connect with the community.
                            </p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg text-sm flex items-center"
                            >
                                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                {error}
                            </motion.div>
                        )}

                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={credentials.email}
                                            onChange={handleChange}
                                            className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all text-sm"
                                            placeholder="your-email@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            required
                                            value={credentials.password}
                                            onChange={handleChange}
                                            className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all text-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none">
                                        Remember for 30 days
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="font-semibold text-green-600 hover:text-green-500 transition-colors">
                                        Forgot password?
                                    </a>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white transition-all ${loading ? 'bg-green-600/70 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-green-200 hover:-translate-y-0.5'}`}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                        Signing in...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        Sign In
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </span>
                                )}
                            </button>

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
                                    <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                    Google
                                </button>
                                <button type="button" className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
                                    <Github className="h-5 w-5 mr-3 text-gray-900" />
                                    GitHub
                                </button>
                            </div>

                            <p className="text-center text-sm text-gray-600 mt-8">
                                Don't have an account?{' '}
                                <Link to="/signup" className="font-bold text-green-600 hover:text-green-500 transition-colors">
                                    Create one for free
                                </Link>
                            </p>
                        </form>
                    </motion.div>
                </div>

                {/* Right Side - Image/Decoration */}
                <div className="hidden lg:flex flex-1 bg-green-50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-green-900/10 z-10"></div>
                    <img
                        className="absolute inset-0 w-full h-full object-cover"
                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
                        alt="Community Login"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-12 z-20 bg-gradient-to-t from-gray-900/80 to-transparent">
                        <blockquote className="max-w-xl">
                            <p className="text-2xl font-medium text-white mb-4">
                                "MigrateMate helped me find a community when I needed it most. It's more than just an app, it's a lifeline."
                            </p>
                            <footer className="flex items-center gap-4">
                                <img src="https://i.pravatar.cc/150?u=a04258a2462d826712d" alt="User" className="w-10 h-10 rounded-full border-2 border-white/50" />
                                <div>
                                    <div className="text-white font-bold">Elena Rodriguez</div>
                                    <div className="text-green-200 text-sm">Joined in 2024</div>
                                </div>
                            </footer>
                        </blockquote>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;