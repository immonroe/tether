'use client';

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
