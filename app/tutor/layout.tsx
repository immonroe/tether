'use client';
/**
 * @fileoverview Tutor page layout with chat interface
 * 
 * This file is part of the Tether AI learning platform.
 * tutor page layout with chat interface for the application.
 */


import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageId } from '@/lib/types';

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentPage, setCurrentPage] = useState<PageId>('tutor');

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
