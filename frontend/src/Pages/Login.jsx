import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { setAuthData, setUserData } from '../utils/auth';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Github, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';

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
        <div className="min-h-screen bg-white font-sans flex text-gray-900">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-20 relative bg-white">
                <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-semibold text-sm">M</div>
                    <span className="font-semibold text-black tracking-tight text-lg">MigrateMate</span>
                </Link>

                <div className="max-w-sm w-full space-y-10">
                    <div className="text-center lg:text-left">
                        <h1 className="text-4xl md:text-5xl font-semibold text-black tracking-tight mb-4">Welcome back</h1>
                        <p className="text-lg text-gray-500 font-normal leading-relaxed">
                            Simplify your workflow and boost your productivity with MigrateMate.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm flex items-center font-medium">
                            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={credentials.email}
                                onChange={handleChange}
                                placeholder="Email Address"
                                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all placeholder:text-gray-400 font-medium text-[15px]"
                            />
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={credentials.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    className="w-full px-6 py-4 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all placeholder:text-gray-400 font-medium text-[15px]"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-2">
                             <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded cursor-pointer accent-black"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-500 cursor-pointer select-none font-medium">
                                    Remember me
                                </label>
                            </div>
                            <Link to="#" className="text-sm font-semibold text-black hover:text-gray-700 transition-colors">
                                Forgot Password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 text-white bg-[#1a3a1d] hover:bg-black rounded-full shadow-xl shadow-black/10 text-[15px] font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Login'}
                        </Button>

                        <div className="relative my-10">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-400 font-medium">or continue with</span>
                            </div>
                        </div>

                        <div className="flex justify-center gap-5">
                            <button type="button" className="w-14 h-14 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-900 transition-all hover:scale-105 shadow-md">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
                            </button>
                            <button type="button" className="w-14 h-14 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-900 transition-all hover:scale-105 shadow-md">
                                <Github className="w-6 h-6" />
                            </button>
                             <button type="button" className="w-14 h-14 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-900 transition-all hover:scale-105 shadow-md">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/></svg>
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-10">
                         <p className="text-gray-500 font-medium">Not a member? <Link to="/signup" className="text-black font-semibold hover:underline">Register now</Link></p>
                    </div>
                </div>
            </div>

            {/* Right Side - Illustration */}
            <div className="hidden lg:flex w-1/2 bg-[#f4fbf0] justify-center items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-200/30 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/3"></div>

                <div className="relative z-10 max-w-lg text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                         {/* Floating Elements mimicking the reference */}
                        <motion.div 
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="absolute -left-16 top-10 bg-white p-5 rounded-[2rem] shadow-2xl shadow-green-900/5 flex items-center gap-4 border border-white/50 backdrop-blur-sm"
                        >
                             <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                <CheckCircle className="w-6 h-6" />
                             </div>
                             <div className="text-left">
                                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Status</div>
                                <div className="text-base font-bold text-black">Verified</div>
                             </div>
                        </motion.div>

                        <motion.div 
                            animate={{ y: [0, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                            className="absolute -right-8 bottom-20 bg-white p-5 rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-white/50 backdrop-blur-sm"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white">
                                     <img src="https://ui-avatars.com/api/?name=Alex&background=random" alt="User" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-black">Alex M.</div>
                                    <div className="text-xs text-gray-500 font-medium">Just joined</div>
                                </div>
                            </div>
                            <div className="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full w-3/4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                            </div>
                        </motion.div>

                        <img 
                            src="https://illustrations.popsy.co/green/working-vacation.svg" 
                            alt="Illustration" 
                            className="w-full h-auto drop-shadow-2xl"
                        />
                    </motion.div>
                    
                    <h2 className="text-4xl font-semibold text-black mt-16 mb-6 leading-tight tracking-tight">Make your move easier <br/>and organized.</h2>
                    <div className="flex justify-center gap-3 mt-8">
                        <div className="w-8 h-2 bg-black rounded-full"></div>
                        <div className="w-2 h-2 bg-black/20 rounded-full"></div>
                        <div className="w-2 h-2 bg-black/20 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;