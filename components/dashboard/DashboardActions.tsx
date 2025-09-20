'use client';
/**
 * @fileoverview Dashboard action buttons and quick access
 * 
 * This file is part of the Tether AI learning platform.
 * dashboard action buttons and quick access for the application.
 */


import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export const DashboardActions: React.FC = () => {
  const router = useRouter();

  return (
    <Button onClick={() => router.push('/tutor')}>
      <Plus className="w-4 h-4 mr-2" />
      Start Learning
    </Button>
  );
};
