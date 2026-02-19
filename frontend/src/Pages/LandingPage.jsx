import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { ArrowRight, CheckCircle, Shield, Users, Globe, MessageSquare, Heart, Star, Sparkles, MapPin, Search } from 'lucide-react';

const LandingPage = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    return (
        <div className="min-h-screen text-gray-900 overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 lg:pt-60 lg:pb-48 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                        className="flex flex-col items-center"
                    >
                        <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/50 backdrop-blur-md border border-white/60 rounded-full text-sm font-medium text-neural-dark mb-10 shadow-sm">
                             <div className="w-2 h-2 rounded-full bg-deep-green animate-pulse" />
                            <span>#1 Trusted Platform for Migrants</span>
                        </motion.div>

                        <motion.h1 variants={fadeIn} className="text-6xl md:text-8xl lg:text-9xl font-semibold tracking-tighter text-neural-dark mb-8 leading-[0.9]">
                            Move with <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-deep-green to-emerald-600">
                                Confidence.
                            </span>
                        </motion.h1>

                        <motion.p variants={fadeIn} className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl font-normal">
                            Your AI-powered companion for a seamless transition.
                            <br className="hidden md:block" /> Connect with verified locals, find housing, and settle in.
                        </motion.p>

                        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4">
                            <Link to="/signup">
                                <Button variant="primary" size="lg" className="shadow-xl shadow-neural-dark/20 text-lg px-10 py-5 font-semibold">
                                    Start Your Journey
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                            <Link to="/marketplace">
                                <Button variant="secondary" size="lg" className="text-lg px-10 py-5 font-semibold">
                                    Explore Services
                                </Button>
                            </Link>
                        </motion.div>
                        
                        {/* Social Proof */}
                         <motion.div variants={fadeIn} className="mt-16 flex items-center gap-4 bg-white/40 backdrop-blur-sm p-3 rounded-full border border-white/50 pr-8">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-sm">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt={`User ${i}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col items-start ml-2">
                                <span className="font-semibold text-neural-dark leading-none">10,000+</span>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Happy Migrants</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Showcase */}
            <section className="py-32 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-24 text-center">
                        <h2 className="text-4xl md:text-5xl font-semibold text-neural-dark mb-6 tracking-tight">Everything you need to <span className="text-deep-green decoration-emerald-200 underline decoration-wavy underline-offset-4">settle in.</span></h2>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto font-normal">We've combined advanced AI with real human connection to solve every challenge of moving abroad.</p>
                    </div>

                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1
                                }
                            }
                        }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                         {[
                            { icon: Shield, title: "Verified Trust", desc: "Mandatory KYC checks ensure every person you interact with is real and verified." },
                            { icon: Sparkles, title: "AI Assistant", desc: "24/7 support for visas, legal contracts, and local laws in your native language." },
                            { icon: Heart, title: "Emergency SOS", desc: "Instant help from nearby community members when you need it most." },
                            { icon: MapPin, title: "Housing & Jobs", desc: "Find safe accommodation and reliable work opportunities listed by the community." },
                            { icon: MessageSquare, title: "Language Support", desc: "Real-time translation for chats and documents. Never feel lost again." },
                            { icon: Globe, title: "Cultural Integration", desc: "Local guides and events to help you feel at home in your new city." }
                        ].map((feature, index) => (
                            <motion.div 
                                key={index} 
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                                }}
                                className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_10px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 text-deep-green">
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-semibold text-neural-dark mb-3">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Large Image / Vibe Section */}
            <section className="py-12 px-4 sm:px-6">
                 <div className="max-w-7xl mx-auto">
                    <div className="relative rounded-[3rem] overflow-hidden aspect-video md:aspect-[21/9] shadow-2xl shadow-deep-green/10">
                        <img 
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
                            alt="Community" 
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-12 md:p-20">
                            <div className="max-w-2xl">
                                <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6">Found in translation.</h2>
                                <p className="text-xl text-white/90 font-medium">Experience the world without losing your sense of belonging. MigrateMate connects you to your people, wherever you go.</p>
                            </div>
                        </div>
                    </div>
                 </div>
            </section>

            {/* Testimonials */}
            <section className="py-32">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Testimonial Cards */}
                        {[
                             { name: "Sarah Chen", role: "Student", text: "MigrateMate saved me weeks of stress. I found a verified apartment in just 2 days.", img: "a042581f4e29026024d" },
                             { name: "Carlos R.", role: "Chef", text: "The AI helped me translate my resume and I found a job immediately. Incredible tool.", img: "a042581f4e29026704d" },
                             { name: "Amara N.", role: "Nurse", text: "I feel so much safer knowing the SOS feature is there. The community is truly supportive.", img: "a04258114e29026702d" }
                        ].map((user, i) => (
                            <Card key={i} delay={0.2 + (i * 0.1)} className="border-none bg-white/40">
                                <div className="flex gap-1 text-deep-green mb-6">
                                    {[...Array(5)].map((_, j) => <Star key={j} size={18} fill="currentColor" />)}
                                </div>
                                <p className="text-xl font-medium text-neural-dark mb-6 leading-relaxed">"{user.text}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                        <img src={`https://i.pravatar.cc/150?u=${user.img}`} alt={user.name} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-neural-dark">{user.name}</h4>
                                        <span className="text-sm text-gray-500 font-medium uppercase">{user.role}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                 </div>
            </section>

            {/* CTA */}
            <section className="pb-32 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto bg-neural-dark rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-deep-green rounded-full blur-[120px] opacity-40 translate-x-1/3 -translate-y-1/3"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-semibold text-white mb-8 tracking-tight">Ready to start your <br/> new chapter?</h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/signup">
                                <Button variant="accent" size="lg" className="px-12 py-5 text-lg shadow-xl shadow-deep-green/30 bg-white text-neural-dark hover:bg-white/90 font-semibold">
                                    Join Now - It's Free
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
