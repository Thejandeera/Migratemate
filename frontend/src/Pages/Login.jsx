import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8080/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('refreshToken', data.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(data.data.user));

                navigate('/dashboard');
            } else {
                setError(data.message || 'Invalid email or password');
            }
        } catch (err) {
            setError('Unable to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F0FDF4] py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-2 mb-6">
                        <div className="bg-[#22C55E] p-2 rounded-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-gray-800">MigrateMate</span>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white py-10 px-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Welcome Back
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Sign in to continue your journey
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Email
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </span>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E] focus:bg-white text-sm transition-all"
                                    placeholder="your-email@example.com"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E] focus:bg-white text-sm transition-all"
                                    placeholder="••••••••••"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-[#22C55E] focus:ring-[#22C55E] border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-500 cursor-pointer">
                                    Remember me
                                </label>
                            </div>

                            <a href="#" className="text-xs font-medium text-[#22C55E] hover:text-[#16A34A] transition-colors">
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white transition-all ${loading
                                ? 'bg-[#22C55E]/70 cursor-not-allowed'
                                : 'bg-[#22C55E] hover:bg-[#16A34A] hover:shadow-lg active:transform active:scale-[0.98]'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22C55E]`}
                        >
                            {loading ? 'Signing In...' : 'Sign In ->'}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="px-2 bg-white text-gray-400">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#EA4335" d="M24 12.276c0-.85-.076-1.666-.217-2.454H12v4.64h6.732c-.29 1.565-1.173 2.89-2.502 3.78v3.138h4.053c2.37-2.183 3.737-5.398 3.737-9.104z" />
                                <path fill="#34A853" d="M12 24c3.24 0 5.957-1.074 7.942-2.906l-4.053-3.138c-1.075.72-2.45 1.146-3.89 1.146-3.004 0-5.546-2.028-6.454-4.755H1.626v3.15C3.606 21.436 7.498 24 12 24z" />
                                <path fill="#FBBC05" d="M5.546 14.347c-.23-.69-.362-1.43-.362-2.196s.132-1.506.362-2.196V6.804H1.626C.59 8.87 0 11.19 0 13.65s.59 4.78 1.626 6.845l3.92-3.148z" />
                                <path fill="#4285F4" d="M12 4.773c1.763 0 3.35.606 4.608 1.808l3.456-3.457C17.954 1.05 15.236 0 12 0 7.498 0 3.606 2.564 1.626 6.804l3.92 3.15c.907-2.727 3.45-4.755 6.454-4.755z" />
                            </svg>
                            <span className="font-medium">Google</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
                            <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-1.74-3.795-1.74-.54-1.38-1.335-1.755-1.335-1.755-.99-.675.075-.66.075-.66 1.095.075 1.665 1.125 1.665 1.125.975 1.665 2.565 1.185 3.18.9.105-.705.375-1.185.69-1.455-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.39.345.735 1.005.735 2.025 0 1.455-.015 2.64-.015 2.985 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            <span className="font-medium">GitHub</span>
                        </button>
                    </div>

                    <div className="mt-8 text-center text-xs text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-semibold text-[#22C55E] hover:text-[#16A34A]">
                            Get started
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;