'use client';
/**
 * @fileoverview Dashboard layout with navigation and sidebar
 * 
 * This file is part of the Tether AI learning platform.
 * dashboard layout with navigation and sidebar for the application.
 */


import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageId } from '@/lib/types';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout 
      currentPage="dashboard" 
    >
      {children}
    </MainLayout>
  );
}
