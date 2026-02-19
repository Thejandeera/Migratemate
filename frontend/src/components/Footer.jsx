import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Box } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="relative z-10 pt-16 pb-12 border-t border-gray-200/50 bg-white/30 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-neural-dark p-1.5 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <Box className="w-4 h-4 text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-xl font-semibold text-neural-dark tracking-tight">
                                MigrateMate
                            </span>
                        </Link>
                        <p className="text-sm text-gray-500 leading-relaxed font-normal max-w-xs">
                            Building bridges for a better tomorrow. A trusted, AI-powered community helping migrants settle with confidence.
                        </p>
                        <div className="flex gap-3">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="p-2.5 bg-white text-gray-400 rounded-full hover:bg-deep-green hover:text-white transition-all hover:scale-110 shadow-sm border border-gray-100">
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-neural-dark mb-6">Platform</h4>
                        <ul className="space-y-3">
                            {['Marketplace', 'Community', 'Journey Planner', 'Emergency SOS'].map((item) => (
                                <li key={item}>
                                    <Link to="#" className="text-sm font-medium text-gray-500 hover:text-deep-green hover:pl-1 transition-all">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold text-neural-dark mb-6">Support</h4>
                        <ul className="space-y-3">
                            {['Help Center', 'Safety & Trust', 'Privacy Policy', 'Terms of Service'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-sm font-medium text-gray-500 hover:text-deep-green hover:pl-1 transition-all">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-neural-dark mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 group cursor-pointer">
                                <div className="p-1.5 bg-white rounded-full shadow-sm text-deep-green group-hover:bg-deep-green group-hover:text-white transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-500 mt-0.5">support@migratemate.com</span>
                            </li>
                            <li className="flex items-start gap-3 group cursor-pointer">
                                <div className="p-1.5 bg-white rounded-full shadow-sm text-deep-green group-hover:bg-deep-green group-hover:text-white transition-colors">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-500 mt-0.5">+94 71 886 09 59</span>
                            </li>
                            <li className="flex items-start gap-3 group cursor-pointer">
                                <div className="p-1.5 bg-white rounded-full shadow-sm text-deep-green group-hover:bg-deep-green group-hover:text-white transition-colors">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-500 mt-0.5">Colombo, Sri Lanka</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">© 2026 MigrateMate. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
