'use client';
/**
 * @fileoverview Mobile-responsive navigation component
 * 
 * This file is part of the Tether AI learning platform.
 * mobile-responsive navigation component for the application.
 */


import React from 'react';
import { Home, MessageCircle, BookOpen, Users, BarChart3 } from 'lucide-react';
import { SidebarItem, PageId } from '@/lib/types';

interface MobileNavigationProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
}

const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'tutor', label: 'AI Tutor', icon: MessageCircle },
  { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
  { id: 'groups', label: 'Study Groups', icon: Users },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
];

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  currentPage, 
  onPageChange 
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
