import React from 'react';
import { motion } from 'framer-motion';
import BlurText from './BlurText';

const PageHeader = ({ 
    badgeText, 
    badgeIcon: BadgeIcon, 
    title, 
    highlightText, 
    description,
    children,
    badgeColor = "text-deep-green",
    badgeBg = "bg-white/60 backdrop-blur-md border border-white/40",
    blobColor1 = "bg-[#1a3a1d]/10",
    blobColor2 = "bg-blue-200"
}) => {
    return (
        <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Reveal Overlay */}
            <motion.div
                initial={{ scaleY: 1 }}
                animate={{ scaleY: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                style={{ originY: 0 }}
                className="fixed inset-0 z-50 bg-[#1a3a1d]"
            />

            {/* Dynamic Background Mesh */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className={`absolute top-0 right-1/4 w-96 h-96 ${blobColor1} rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob`}></div>
                <div className={`absolute top-0 left-1/4 w-96 h-96 ${blobColor2} rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000`}></div>
                <div className={`absolute -bottom-32 right-1/3 w-96 h-96 ${blobColor1} rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000`}></div>
            </div>

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`inline-flex items-center gap-2 px-4 py-1.5 ${badgeBg} rounded-full ${badgeColor} text-xs font-bold uppercase tracking-wider mb-8 shadow-sm`}
                >
                    {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5" />}
                    {badgeText}
                </motion.div>
                
                <h1 className="text-6xl md:text-8xl font-light text-neural-dark mb-8 tracking-tighter leading-[1.1] md:leading-[1.1]">
                    <BlurText 
                        text={title} 
                        delay={150} 
                        animateBy="words" 
                        direction="top"
                        className="inline-block mb-2 md:mb-0"
                    />
                    <br className="hidden md:block" />
                    <motion.span 
                        initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
                        animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                        className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-deep-green via-[#2d5a32] to-deep-green font-normal pb-4"
                    >
                        {highlightText}
                    </motion.span>
                </h1>
                
                <p className="text-xl text-gray-500 font-light leading-relaxed max-w-2xl mx-auto mb-10">
                    {description}
                </p>

                {children && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {children}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
