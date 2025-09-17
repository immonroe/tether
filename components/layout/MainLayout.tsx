'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { PageId } from '@/lib/types';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  currentPage, 
  onPageChange 
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onPageChange={onPageChange}
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
        onPageChange={onPageChange}
      />
    </div>
  );
};
