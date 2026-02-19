import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import TextType from '../components/TextType';



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




            {/* Hero Section */}
            <section className="fixed top-0 left-0 w-full h-screen z-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a3a1d] via-[#244f28] to-[#112613] animate-gradient-xy">
                {/* Noise Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                
                {/* Ambient Blobs */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] mix-blend-overlay animate-blob"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-overlay animate-blob animation-delay-2000"></div>

                <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 w-full">
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                        className="flex flex-col items-center text-center"
                    >
                        {/* Title */}
                        <motion.h1 variants={fadeIn} className="text-6xl md:text-8xl lg:text-9xl font-light tracking-tighter text-white mb-8 leading-[0.9] md:leading-[1.1]">
                            <span className="block text-3xl md:text-4xl lg:text-5xl opacity-90 -mb-8 font-medium tracking-normal leading-tight">Move with</span>
                            <TextType
                                text={[
                                    "Confidence.",
                                    "Ease.",
                                    "Purpose.",
                                    "Support."
                                ]}
                                typingSpeed={100}
                                deletingSpeed={50}
                                pauseDuration={1500}
                                loop={true}
                                cursorCharacter="|"
                                cursorClassName="text-emerald-400 font-light"
                                className="inline-block font-medium text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-white to-emerald-200 pb-4"
                            />
                        </motion.h1>

                        <motion.p variants={fadeIn} className="text-xl md:text-2xl text-white/60 mb-12 leading-relaxed max-w-2xl font-light mx-auto">
                            Your AI-powered companion for a seamless transition.
                            <br className="hidden md:block" /> Connect with verified locals, find housing, and settle in.
                        </motion.p>

                        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-5">
                            <Link to="/signup">
                                <Button size="lg" className="!bg-white !text-[#1a3a1d] hover:!bg-white/90 shadow-xl shadow-black/10 text-lg px-10 py-5 font-semibold rounded-full border-none transition-transform hover:scale-105">
                                    Start Your Journey
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                            <Link to="/marketplace">
                                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 text-lg px-10 py-5 font-medium rounded-full backdrop-blur-md">
                                    Explore Services
                                </Button>
                            </Link>
                        </motion.div>
                        
                        {/* Social Proof - Dark Mode Version */}
                         <motion.div variants={fadeIn} className="mt-20 flex items-center gap-4 bg-white/5 backdrop-blur-md p-2 pr-6 rounded-full border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                            <div className="flex -space-x-4 pl-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1a3a1d] bg-gray-600 overflow-hidden relative">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt={`User ${i}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col items-start ml-2">
                                <span className="font-semibold text-white leading-none text-sm">10,000+</span>
                                <span className="text-[10px] font-medium text-white/50 uppercase tracking-wide">Happy Migrants</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            <div className="relative z-10 bg-[#F5F5F7] mt-[100vh]">
                {/* Features Showcase */}
                <section className="py-32 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-24 text-center">
                            <h2 className="text-4xl md:text-5xl font-semibold text-neural-dark mb-6 tracking-tight">Everything you need to <span className="text-deep-green decoration-[#1a3a1d]/30 underline decoration-wavy underline-offset-4">settle in.</span></h2>
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
                                    <div className="w-14 h-14 bg-[#1a3a1d]/5 rounded-2xl flex items-center justify-center mb-6 text-deep-green">
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
                    <div className="max-w-5xl mx-auto bg-deep-green rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-deep-green rounded-full blur-[120px] opacity-40 translate-x-1/3 -translate-y-1/3"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-semibold text-white mb-8 tracking-tight">Ready to start your <br/> new chapter?</h2>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/signup">
                                    <Button size="lg" className="px-12 py-5 text-lg shadow-xl shadow-deep-green/30 !bg-white !text-neural-dark hover:!bg-white/90 font-semibold border-none">
                                        Join Now - It's Free
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
        </div>
    );
};

export default LandingPage;
