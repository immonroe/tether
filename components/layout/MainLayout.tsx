'use client';
/**
 * @fileoverview Main application layout wrapper
 * 
 * This file is part of the Tether AI learning platform.
 * main application layout wrapper for the application.
 */


import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { PageId } from '@/lib/types';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: PageId;
  onPageChange?: (page: PageId) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  currentPage, 
  onPageChange 
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();

  const handlePageChange = (page: PageId) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      router.push(`/${page}`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onPageChange={handlePageChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentPage={currentPage} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      
      <MobileNavigation
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
