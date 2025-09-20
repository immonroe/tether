'use client';
/**
 * @fileoverview Application header with navigation
 * 
 * This file is part of the Tether AI learning platform.
 * application header with navigation for the application.
 */


import React from 'react';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ currentPage }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900 capitalize">
            {currentPage === 'tutor' ? 'AI Tutor' : currentPage}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <div className="relative">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <div className="w-5 h-5 relative">
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5c-.4-.4-.4-1.1 0-1.5L20 8.5c.4-.4.4-1.1 0-1.5L16.5 3.5c-.4-.4-1.1-.4-1.5 0L11.5 7c-.4.4-1.1.4-1.5 0L6.5 3.5c-.4-.4-1.1-.4-1.5 0L1.5 7c-.4.4-.4 1.1 0 1.5L5 11.5c.4.4.4 1.1 0 1.5L1.5 16c-.4.4-.4 1.1 0 1.5L5 20.5c.4.4 1.1.4 1.5 0L10 17h5z" />
                </svg>
              </div>
            </button>
          </div>
          
          {/* Quick Actions */}
          <Button variant="outline" size="small">
            Sign Up - Save Progress
          </Button>
        </div>
      </div>
    </header>
  );
};
