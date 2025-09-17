'use client';

import React from 'react';
import { Home, MessageCircle, BookOpen, Users, BarChart3, ChevronRight, User, Settings } from 'lucide-react';
import { SidebarItem, PageId } from '@/lib/types';

interface SidebarProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'tutor', label: 'AI Tutor', icon: MessageCircle },
  { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
  { id: 'groups', label: 'Study Groups', icon: Users },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  onPageChange, 
  collapsed, 
  onToggleCollapse 
}) => {
  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          {!collapsed && (
            <h1 className="text-xl font-bold text-gray-900">Tether</h1>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md hover:bg-gray-100"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>
        
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center px-3 py-2 rounded-md transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>
      
      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Guest User</p>
              <p className="text-xs text-gray-500">Sign up to save progress</p>
            </div>
            <Settings className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
        </div>
      )}
    </div>
  );
};
