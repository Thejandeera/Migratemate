import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // Assuming you use framer-motion based on past projects

const Signup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        countryOfOrigin: '',
        destinationCountry: '',
        avatarBase64: '',
        passportImageBase64: '',
        selfieImageBase64: ''
    });

    // Handle Text Inputs
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle File Inputs & Convert to Base64
    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev) => ({
                    ...prev,
                    [fieldName]: reader.result // This contains the Base64 string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8080/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Registration successful
                alert('Registration Successful! Please Login.');
                navigate('/');
            } else {
                setError(data.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError('Network error. Is the backend server running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-xl shadow-lg"
            >
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Join MigrateMate
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Start your journey to a new life
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Details */}
                        <input
                            name="firstName"
                            type="text"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="First Name"
                            onChange={handleChange}
                        />
                        <input
                            name="lastName"
                            type="text"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Last Name"
                            onChange={handleChange}
                        />
                        <input
                            name="email"
                            type="email"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Email address"
                            onChange={handleChange}
                        />
                        <input
                            name="phone"
                            type="tel"
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Phone Number"
                            onChange={handleChange}
                        />
                        <input
                            name="countryOfOrigin"
                            type="text"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Country of Origin"
                            onChange={handleChange}
                        />
                        <input
                            name="destinationCountry"
                            type="text"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Destination Country"
                            onChange={handleChange}
                        />

                        {/* Password - Spanning full width */}
                        <div className="col-span-1 md:col-span-2">
                            <input
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Password"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Identity Verification</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Avatar Upload */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'avatarBase64')}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>

                            {/* Passport Upload */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Passport Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'passportImageBase64')}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>

                            {/* Selfie Upload */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Verification Selfie</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'selfieImageBase64')}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Already have an account? Sign in
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Signup;