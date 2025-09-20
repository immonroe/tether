'use client';
/**
 * @fileoverview Learning path visualization component
 * 
 * This file is part of the Tether AI learning platform.
 * learning path visualization component for the application.
 */


import React from 'react';
import { Check } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LearningPath as LearningPathType } from '@/lib/types';

interface LearningPathProps {
  paths: LearningPathType[];
}

export const LearningPath: React.FC<LearningPathProps> = ({ paths }) => {
  return (
    <div className="space-y-4">
      {paths.map((path) => (
        <div key={path.id} className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            path.status === 'completed' 
              ? 'bg-green-500' 
              : path.status === 'in-progress' 
              ? 'bg-blue-500' 
              : 'bg-gray-300'
          }`}>
            {path.status === 'completed' ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <div className="w-3 h-3 bg-white rounded-full"></div>
            )}
          </div>
          <div className="flex-1">
            <p className={`font-medium ${
              path.status === 'locked' ? 'text-gray-700' : 'text-gray-900'
            }`}>
              {path.title}
            </p>
            <p className="text-sm text-gray-500">
              {path.status === 'completed' 
                ? `Completed • ${path.completedConcepts} concepts mastered`
                : path.status === 'in-progress'
                ? `In Progress • ${path.completedConcepts}/${path.totalConcepts} concepts`
                : 'Locked • Complete previous section'
              }
            </p>
            {path.status === 'in-progress' && (
              <ProgressBar progress={path.progress} className="mt-1" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
