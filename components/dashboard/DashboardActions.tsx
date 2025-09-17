'use client';

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
