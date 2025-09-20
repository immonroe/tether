/**
 * @fileoverview Card container component for content sections
 * 
 * This file is part of the Tether AI learning platform.
 * card container component for content sections for the application.
 */

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
