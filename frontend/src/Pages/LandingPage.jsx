import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <Navbar />


            <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#F0FDF4]">

                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#22C55E 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-full text-xs font-medium text-[#16A34A] mb-8">
                            <span className="w-2 h-2 bg-[#16A34A] rounded-full animate-pulse"></span>
                            Trusted by 10,000+ migrants worldwide
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
                            Bridging Borders <span className="text-[#22C55E]">with Trust</span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                            A verified, AI-assisted community for international migrants.
                            Find trusted help, safe housing, and a welcoming community.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/signup" className="w-full sm:w-auto px-8 py-3.5 bg-[#22C55E] text-white rounded-lg font-bold shadow-lg hover:bg-[#16A34A] hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                                Find Help
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                            </Link>
                            <Link to="/signup" className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-700 border border-gray-200 rounded-lg font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2">
                                <svg className="w-4 h-4 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                Become a Helper
                            </Link>
                        </div>

                        <div className="mt-12 flex items-center justify-center gap-8 text-xs text-gray-500 font-medium opacity-80">
                            <div className="flex items-center gap-2">
                                <div className="p-1 bg-[#22C55E]/10 rounded-full"><svg className="w-3 h-3 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                                100% Verified Helpers
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-1 bg-[#22C55E]/10 rounded-full"><svg className="w-3 h-3 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                                50+ Countries
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-1 bg-[#22C55E]/10 rounded-full"><svg className="w-3 h-3 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>
                                AI Powered Support
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Built for <span className="text-[#22C55E]">Safety & Trust</span>
                        </h2>
                        <p className="mt-4 text-gray-500 max-w-2xl mx-auto text-sm">
                            Every feature designed with your safety in mind. We verify everyone so you can focus on settling in.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        <div className="p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow bg-white group">
                            <div className="w-12 h-12 bg-[#22C55E]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Mandatory KYC</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Every helper is verified through government ID and facial recognition for your safety.
                            </p>
                        </div>


                        <div className="p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow bg-white group">
                            <div className="w-12 h-12 bg-[#22C55E]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Community Marketplace</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Connect with locals who offer housing, transport, job help, and cultural orientation.
                            </p>
                        </div>


                        <div className="p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow bg-white group">
                            <div className="w-12 h-12 bg-[#22C55E]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">AI Safety Net</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Our AI monitors conversations and transactions to flag suspicious activity instantly.
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 flex justify-center gap-8 text-[10px] text-gray-400 font-medium tracking-wide uppercase">
                        <div className="flex items-center gap-2"><svg className="w-4 h-4 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Escrow payments for security</div>
                        <div className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg> End-to-end encrypted messaging</div>
                        <div className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> 24/7 emergency SOS support</div>
                    </div>
                </div>
            </section>


            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Stories from Our <span className="text-[#22C55E]">Community</span>
                        </h2>
                        <p className="mt-4 text-gray-500 max-w-2xl mx-auto text-sm">
                            Real experiences from migrants who found their footing with MigrateMate.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="text-[#22C55E] text-4xl mb-4 font-serif">"</div>
                            <div className="flex gap-1 text-yellow-400 mb-4">
                                {[...Array(5)].map((_, i) => <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                            </div>
                            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                MigrateMate connected me with Sarah who helped me find safe housing near my university. The verification process gave me peace of mind as a young woman moving alone.
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                                    <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="User" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-bold text-gray-900">Amara Jayasuriya</h5>
                                    <p className="text-xs text-gray-500">Student from Sri Lanka</p>
                                </div>
                            </div>
                        </div>


                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="text-[#22C55E] text-4xl mb-4 font-serif">"</div>
                            <div className="flex gap-1 text-yellow-400 mb-4">
                                {[...Array(5)].map((_, i) => <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                            </div>
                            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                The AI assistant helped me understand Australian tax and superannuation. The community forum is amazing - I found a job within my first month!
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                                    <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-bold text-gray-900">Rajiv Patel</h5>
                                    <p className="text-xs text-gray-500">Engineer from India</p>
                                </div>
                            </div>
                        </div>


                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="text-[#22C55E] text-4xl mb-4 font-serif">"</div>
                            <div className="flex gap-1 text-yellow-400 mb-4">
                                {[...Array(5)].map((_, i) => <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                            </div>
                            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                When my flight was delayed at midnight, I used the SOS feature and a verified helper came to pick me up. I felt safe knowing they were background-checked.
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                                    <img src="https://i.pravatar.cc/150?u=a04258114e29026702d" alt="User" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-bold text-gray-900">Chen Wei</h5>
                                    <p className="text-xs text-gray-500">Nurse from China</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
