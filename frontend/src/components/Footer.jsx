import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-[#22C55E] p-1.5 rounded-lg">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                            </div>
                            <span className="text-lg font-bold text-gray-800">
                                MigrateMate
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
                            Bridging borders with trust. A verified, AI-assisted community for international migrants.
                        </p>
                    </div>


                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-4">Quick Links</h4>
                        <ul className="space-y-2.5">
                            <li><a href="#" className="text-xs text-gray-500 hover:text-[#22C55E]">Find Services</a></li>
                            <li><a href="#" className="text-xs text-gray-500 hover:text-[#22C55E]">Community</a></li>
                            <li><a href="#" className="text-xs text-gray-500 hover:text-[#22C55E]">Emergency SOS</a></li>
                            <li><a href="#" className="text-xs text-gray-500 hover:text-[#22C55E]">Get Verified</a></li>
                        </ul>
                    </div>


                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-4">Support</h4>
                        <ul className="space-y-2.5">
                            <li><a href="#" className="text-xs text-gray-500 hover:text-[#22C55E]">Help Center</a></li>
                            <li><a href="#" className="text-xs text-gray-500 hover:text-[#22C55E]">Safety Guidelines</a></li>
                            <li><a href="#" className="text-xs text-gray-500 hover:text-[#22C55E]">Privacy Policy</a></li>
                            <li><a href="#" className="text-xs text-gray-500 hover:text-[#22C55E]">Terms of Service</a></li>
                        </ul>
                    </div>


                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-4">Contact Us</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-xs text-gray-500">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                support@migratemate.com
                            </li>
                            <li className="flex items-center gap-2 text-xs text-gray-500">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                +61 2 1234 5678
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] text-gray-400">© 2026 MigrateMate. All rights reserved.</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        Made by  <span className="text-red-400"></span> Hell Fire Club
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
