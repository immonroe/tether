/**
 * @fileoverview Loading spinner component
 * 
 * This file is part of the Tether AI learning platform.
 * loading spinner component for the application.
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "medium", 
  className = "",
  text
}) => {
  const sizes = {
    small: "w-4 h-4",
    medium: "w-6 h-6", 
    large: "w-8 h-8"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <div 
          className={`${sizes[size]} border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin`}
        />
        {text && (
          <p className="text-sm text-gray-600">{text}</p>
        )}
      </div>
    </div>
  );
};
