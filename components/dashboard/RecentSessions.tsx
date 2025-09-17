'use client';

import React from 'react';
import { MessageCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export const RecentSessions: React.FC = () => {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <MessageCircle className="w-5 h-5 text-blue-500" />
          <div>
            <p className="font-medium text-gray-900">Calculus Derivatives</p>
            <p className="text-sm text-gray-500">45 minutes ago</p>
          </div>
        </div>
        <Button variant="ghost" size="small" onClick={() => router.push('/tutor')}>
          Resume
        </Button>
      </div>
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-5 h-5 text-green-500" />
          <div>
            <p className="font-medium text-gray-900">Physics Flashcards</p>
            <p className="text-sm text-gray-500">2 hours ago</p>
          </div>
        </div>
        <Button variant="ghost" size="small" onClick={() => router.push('/flashcards')}>
          Review
        </Button>
      </div>
    </div>
  );
};
