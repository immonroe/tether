/**
 * @fileoverview Skeleton loading component
 * 
 * This file is part of the Tether AI learning platform.
 * skeleton loading component for the application.
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = "",
  lines = 1,
  height = "h-4"
}) => {
  if (lines === 1) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse rounded ${height} ${className}`}
      />
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 animate-pulse rounded ${height} ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};
