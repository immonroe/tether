'use client';

import React from 'react';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface StudyStatisticsProps {
  weeklyGoal: number;
  weeklyProgress: number;
  cardsReviewed: number;
  accuracyRate: number;
  groupSessions: number;
  dayStreak: number;
}

export const StudyStatistics: React.FC<StudyStatisticsProps> = ({
  weeklyGoal,
  weeklyProgress,
  cardsReviewed,
  accuracyRate,
  groupSessions,
  dayStreak
}) => {
  const progressPercentage = (weeklyProgress / weeklyGoal) * 100;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Weekly Study Goal</span>
          <span className="text-sm text-gray-600">{weeklyProgress} / {weeklyGoal} hours</span>
        </div>
        <ProgressBar progress={progressPercentage} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{cardsReviewed}</div>
          <div className="text-xs text-blue-700">Cards Reviewed</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{accuracyRate}%</div>
          <div className="text-xs text-green-700">Accuracy Rate</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{groupSessions}</div>
          <div className="text-xs text-purple-700">Group Sessions</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{dayStreak}</div>
          <div className="text-xs text-orange-700">Day Streak</div>
        </div>
      </div>
    </div>
  );
};
