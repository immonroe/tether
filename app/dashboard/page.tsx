'use client';

import React from 'react';
import { Plus, Flame, Target, Clock, Award, MessageCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PageId } from '@/lib/types';

interface DashboardPageProps {
  onPageChange: (page: PageId) => void;
}

export default function DashboardPage({ onPageChange }: DashboardPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600">Ready to continue your learning journey?</p>
        </div>
        <Button onClick={() => onPageChange('tutor')}>
          <Plus className="w-4 h-4 mr-2" />
          Start Learning
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Study Streak</p>
              <p className="text-2xl font-bold text-gray-900">7 days</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="w-8 h-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Concepts Mastered</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Time Studied</p>
              <p className="text-2xl font-bold text-gray-900">12.5 hrs</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="w-8 h-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Achievements</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">Calculus Derivatives</p>
                  <p className="text-sm text-gray-500">45 minutes ago</p>
                </div>
              </div>
              <Button variant="ghost" size="small">Resume</Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">Physics Flashcards</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              <Button variant="ghost" size="small">Review</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Reviews</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <p className="font-medium text-gray-900">Math Concepts</p>
                <p className="text-sm text-yellow-700">5 cards due in 2 hours</p>
              </div>
              <Badge variant="warning">Due Soon</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="font-medium text-gray-900">Study Group Session</p>
                <p className="text-sm text-blue-700">Calculus Crew - Today 3:00 PM</p>
              </div>
              <Badge variant="info">Scheduled</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
