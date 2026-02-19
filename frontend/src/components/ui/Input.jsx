import React from 'react';

const Input = ({ 
  label, 
  error, 
  className = '', 
  containerClassName = '',
  ...props 
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 ml-1">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm
          focus:outline-none focus:ring-2 focus:ring-neural-dark/20 focus:border-neural-dark/40
          placeholder:text-gray-400 transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-200' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 ml-1">{error}</span>
      )}
    </div>
  );
};

export default Input;
