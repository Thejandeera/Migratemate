import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Box } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl shadow-lg shadow-green-200 group-hover:shadow-green-300 transition-all duration-300 group-hover:-translate-y-0.5">
                                <Box className="w-5 h-5 text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">
                                MigrateMate
                            </span>
                        </Link>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Building bridges for a better tomorrow. A trusted, AI-powered community helping migrants settle with confidence and ease.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-green-50 hover:text-green-600 transition-all hover:-translate-y-1">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Platform</h4>
                        <ul className="space-y-3">
                            {['Marketplace', 'Community', 'Journey Planner', 'Emergency SOS'].map((item) => (
                                <li key={item}>
                                    <Link to="#" className="text-sm text-gray-500 hover:text-green-600 hover:pl-1 transition-all">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Support</h4>
                        <ul className="space-y-3">
                            {['Help Center', 'Safety & Trust', 'Privacy Policy', 'Terms of Service'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-sm text-gray-500 hover:text-green-600 hover:pl-1 transition-all">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-green-500 mt-0.5" />
                                <span className="text-sm text-gray-500">support@migratemate.com</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-green-500 mt-0.5" />
                                <span className="text-sm text-gray-500">+94 71 886 09 59</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-green-500 mt-0.5" />
                                <span className="text-sm text-gray-500">Colombo, Sri Lanka</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs font-medium text-gray-400">© 2026 MigrateMate. All rights reserved.</p>
                    <p className="text-xs font-medium text-gray-400 flex items-center gap-1">
                        Made with <span className="text-red-400">♥</span> by Hell Fire Club
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
