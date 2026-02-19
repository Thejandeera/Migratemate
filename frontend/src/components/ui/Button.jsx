import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
  
  const variants = {
    primary: "bg-neural-dark text-white hover:bg-black hover:shadow-lg shadow-md focus:ring-neural-dark",
    secondary: "bg-white/80 backdrop-blur-md border border-white/40 text-neural-dark hover:bg-white hover:shadow-md focus:ring-gray-200",
    accent: "bg-deep-green text-white hover:bg-opacity-90 hover:shadow-lg shadow-md focus:ring-deep-green",
    ghost: "bg-transparent text-neural-dark hover:bg-gray-100/50 focus:ring-gray-200",
    outline: "bg-transparent border-2 border-neural-dark text-neural-dark hover:bg-neural-dark hover:text-white focus:ring-neural-dark"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    icon: "p-3"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
