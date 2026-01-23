import React, { useEffect, useState } from 'react';
import { useAuthContext } from "@asgardeo/auth-react";
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { setAuthData, setUserData } from '../utils/auth'; // Keep your existing utils

const Login = () => {
    const { state, signIn, getAccessToken, getBasicUserInfo } = useAuthContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");

    // Automatically trigger sync when Asgardeo says "Authenticated: true"
    useEffect(() => {
        if (state.isAuthenticated) {
            syncUserWithBackend();
        }
    }, [state.isAuthenticated]);

    const syncUserWithBackend = async () => {
        setLoading(true);
        setStatusMsg("Syncing with MigrateMate Database...");
        try {
            // 1. Get the Token that proves who we are
            const accessToken = await getAccessToken();

            // 2. Send it to YOUR Backend
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/auth/sync`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`, // 🟢 This is what SecurityConfig checks!
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                // 3. Save user data to your local storage (keep your existing logic)
                // Note: You might want to get the user info from Asgardeo SDK too
                const basicInfo = await getBasicUserInfo();

                setAuthData({
                    token: accessToken,
                    refreshToken: null, // Asgardeo handles refresh internally usually, or you can get it
                    id: data.data.id
                }, true);

                setUserData(data.data);

                // 4. Decide where to go
                if (!data.data.isVerified) {
                    setStatusMsg("Redirecting to verification...");
                    navigate('/complete-profile'); // Go upload passport
                } else {
                    setStatusMsg("Login successful!");
                    navigate('/dashboard');
                }
            } else {
                setStatusMsg("Sync failed: " + data.message);
            }
        } catch (error) {
            console.error(error);
            setStatusMsg("Connection error to Backend.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0FDF4] font-sans flex flex-col">
            <Navbar />
            <div className="flex-grow flex items-center justify-center pt-20 px-4">
                <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl text-center">

                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back</h2>
                    <p className="text-gray-500 mb-8">Sign in securely to continue</p>

                    {/* Status Message Area */}
                    {statusMsg && (
                        <div className={`mb-6 p-3 rounded text-sm ${statusMsg.includes("failed") ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
                            {statusMsg}
                        </div>
                    )}

                    {/* The Main Button */}
                    {!state.isAuthenticated ? (
                        <button
                            onClick={() => signIn()}
                            disabled={loading}
                            className="w-full py-3 px-4 bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold rounded-lg transition-all shadow-md flex justify-center items-center gap-2"
                        >
                            {loading ? "Connecting..." : "Sign In with Asgardeo"}
                        </button>
                    ) : (
                        <div className="text-[#22C55E] font-semibold animate-pulse">
                            Logging you in...
                        </div>
                    )}

                    <div className="mt-6 text-xs text-gray-400">
                        Powered by WSO2 Asgardeo & Choreo
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;