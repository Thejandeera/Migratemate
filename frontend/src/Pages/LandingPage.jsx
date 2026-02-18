import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowRight, CheckCircle, Shield, Users, Globe, MessageSquare, Heart, Star, Sparkles, MapPin, Search } from 'lucide-react';

const LandingPage = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-white">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(#22C55E_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.05]"></div>
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <motion.div
                            className="flex-1 text-center lg:text-left"
                            initial="initial"
                            animate="animate"
                            variants={staggerContainer}
                        >
                            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-full text-sm font-semibold text-green-700 mb-8 shadow-sm">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                </span>
                                #1 Trusted Platform for Migrants
                            </motion.div>

                            <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
                                Moving Countries? <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                                    Don't Do It Alone.
                                </span>
                            </motion.h1>

                            <motion.p variants={fadeIn} className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                Connect with verified locals for housing, jobs, and advice.
                                MigrateMate is your AI-powered companion for a seamless transition.
                            </motion.p>

                            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-green-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-green-200 hover:bg-green-700 hover:shadow-2xl hover:shadow-green-300 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                                    Start Your Journey
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link to="/marketplace" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
                                    <Search className="w-5 h-5 text-gray-400" />
                                    Explore Services
                                </Link>
                            </motion.div>

                            <motion.div variants={fadeIn} className="mt-12 flex items-center justify-center lg:justify-start gap-6 text-sm font-medium text-gray-500">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt={`User ${i}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-green-50 flex items-center justify-center text-xs text-green-700 font-bold">
                                        +2k
                                    </div>
                                </div>
                                <div>
                                    <div className="flex gap-1 text-yellow-500">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                    </div>
                                    <p>Loved by 10,000+ users</p>
                                </div>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            className="flex-1 relative hidden lg:block"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="relative">
                                {/* Decorative Blobs */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-green-200 to-blue-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>

                                {/* Main Image Card */}
                                <div className="relative z-10 bg-white p-4 rounded-3xl shadow-2xl border border-gray-100 rotate-[-2deg] hover:rotate-0 transition-all duration-500">
                                    <img
                                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                        alt="Community"
                                        className="rounded-2xl w-full h-auto object-cover"
                                    />

                                    {/* Floating Badges */}
                                    <div className="absolute -left-8 top-12 bg-white p-4 rounded-2xl shadow-xl border border-gray-50 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                                        <div className="bg-green-100 p-2 rounded-lg text-green-600">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold">Verification</p>
                                            <p className="text-sm font-bold text-gray-900">100% ID Verified</p>
                                        </div>
                                    </div>

                                    <div className="absolute -right-8 bottom-12 bg-white p-4 rounded-2xl shadow-xl border border-gray-50 flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s' }}>
                                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold">Community</p>
                                            <p className="text-sm font-bold text-gray-900">50+ Countries</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-green-600 font-bold tracking-wider uppercase text-sm">Why Choose Us</span>
                        <h2 className="text-4xl font-extrabold text-gray-900 mt-3 mb-6">
                            Everything You Need to <br /> <span className="text-green-600">Settle In Smoothly</span>
                        </h2>
                        <p className="text-lg text-gray-500">
                            We've combined AI technology with human trust to build the safest platform for migrants worldwide.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Shield,
                                title: "Mandatory KYC Verification",
                                desc: "Every user is government-ID verified. No bots, no scams, just real people you can trust.",
                                color: "bg-green-100 text-green-600"
                            },
                            {
                                icon: Sparkles,
                                title: "AI-Powered Assistance",
                                desc: "Our AI helps navigate visas, contracts, and local laws instantly, 24/7 in your language.",
                                color: "bg-purple-100 text-purple-600"
                            },
                            {
                                icon: MessageSquare,
                                title: "Safe Community Forums",
                                desc: "Connect with people from your home country who have already made the move.",
                                color: "bg-blue-100 text-blue-600"
                            },
                            {
                                icon: MapPin,
                                title: "Verified Housing & Jobs",
                                desc: "Find accommodation and employment opportunities listed by verified community members.",
                                color: "bg-orange-100 text-orange-600"
                            },
                            {
                                icon: Heart,
                                title: "Emergency SOS Support",
                                desc: "One-tap emergency assistance connects you with nearby verified helpers instantly.",
                                color: "bg-red-100 text-red-600"
                            },
                            {
                                icon: Globe,
                                title: "Cross-Cultural Events",
                                desc: "Join local meetups and cultural exchange events to make new friends faster.",
                                color: "bg-teal-100 text-teal-600"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="p-8 rounded-3xl bg-gray-50 hover:bg-white border border-gray-100 hover:shadow-xl transition-all group"
                            >
                                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/20 rounded-full blur-[100px]"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <h2 className="text-4xl font-extrabold mb-4">Voices from our Community</h2>
                            <p className="text-gray-400 max-w-xl">
                                Join thousands of people who have found their new home away from home.
                            </p>
                        </div>
                        <Link to="/community" className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-medium transition-all backdrop-blur-sm">
                            Read Success Stories
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                name: "Sarah Chen",
                                role: "Student from China",
                                img: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
                                quote: "I was terrified moving to Toronto alone. MigrateMate connected me with a senior student who helped me find an apartment in 2 days!"
                            },
                            {
                                name: "Carlos Rodriguez",
                                role: "Chef from Mexico",
                                img: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
                                quote: "The job market was confusing until I used the AI assistant to fix my resume. I landed a job at a top restaurant within a week."
                            },
                            {
                                name: "Amara Ndiaye",
                                role: "Nurse from Senegal",
                                img: "https://i.pravatar.cc/150?u=a04258114e29026702d",
                                quote: "The SOS feature is a lifesaver. When I got lost late at night, a verified community volunteer guided me home safely."
                            }
                        ].map((user, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10">
                                <div className="flex gap-1 text-green-400 mb-6">
                                    {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                                </div>
                                <p className="text-lg text-gray-300 italic mb-8">"{user.quote}"</p>
                                <div className="flex items-center gap-4">
                                    <img src={user.img} alt={user.name} className="w-12 h-12 rounded-full border-2 border-green-500/50" />
                                    <div>
                                        <h4 className="font-bold text-white">{user.name}</h4>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">{user.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                                Ready to Start Your New Chapter?
                            </h2>
                            <p className="text-green-100 text-xl max-w-2xl mx-auto mb-10">
                                Join a community that cares. Safe, verified, and always here to help you succeed.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/signup" className="px-10 py-4 bg-white text-green-700 rounded-2xl font-bold text-lg shadow-lg hover:bg-gray-50 transition-all hover:scale-105">
                                    Join Now - It's Free
                                </Link>
                                <Link to="/marketplace" className="px-10 py-4 bg-green-700 text-white border border-green-500 rounded-2xl font-bold text-lg hover:bg-green-600 transition-all">
                                    Browse Services
                                </Link>
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
