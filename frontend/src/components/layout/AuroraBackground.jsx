import React from 'react';
import { motion } from 'framer-motion';

const AuroraBackground = ({ children, className = "" }) => {
  return (
    <div className={`relative w-full min-h-screen bg-slate-50 text-slate-900 transition-colors duration-500 overflow-hidden ${className}`}>
      <div className="fixed inset-0 z-0 pointer-events-none">
         {/* Deep Green Blob */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#1a3a1d]/10 rounded-full blur-[120px] mix-blend-multiply animate-blob filter" />
        
        {/* Mint/Aurora Blob */}
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-emerald-100/40 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-2000 filter" />
        
        {/* Soft Blue Blob */}
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-blue-100/40 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-4000 filter" />

        {/* Grain Overlay for texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>
      
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default AuroraBackground;
