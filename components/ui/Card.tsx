import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "", ...props }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);
