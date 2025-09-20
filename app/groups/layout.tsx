'use client';
/**
 * @fileoverview Study groups page layout
 * 
 * This file is part of the Tether AI learning platform.
 * study groups page layout for the application.
 */


import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageId } from '@/lib/types';

export default function GroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentPage, setCurrentPage] = useState<PageId>('groups');

  const handlePageChange = (page: PageId) => {
    setCurrentPage(page);
    // In a real app, you'd use Next.js router here
    window.location.href = `/${page}`;
  };

  return (
    <MainLayout 
      currentPage={currentPage} 
      onPageChange={handlePageChange}
    >
      {children}
    </MainLayout>
  );
}
