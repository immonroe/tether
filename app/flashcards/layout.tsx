'use client';
/**
 * @fileoverview Flashcard page layout with study interface
 * 
 * This file is part of the Tether AI learning platform.
 * flashcard page layout with study interface for the application.
 */


import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageId } from '@/lib/types';

export default function FlashcardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentPage, setCurrentPage] = useState<PageId>('flashcards');

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
