'use client';
/**
 * @fileoverview Progress page layout with statistics
 * 
 * This file is part of the Tether AI learning platform.
 * progress page layout with statistics for the application.
 */


import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageId } from '@/lib/types';

export default function ProgressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentPage, setCurrentPage] = useState<PageId>('progress');

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
