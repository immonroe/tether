'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Achievement } from '@/lib/types';

interface AchievementSystemProps {
  achievements: Achievement[];
}

export const AchievementSystem: React.FC<AchievementSystemProps> = ({ achievements }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {achievements.map((achievement) => (
        <div 
          key={achievement.id} 
          className={`p-4 rounded-lg border-2 ${
            achievement.earned 
              ? 'border-green-200 bg-green-50' 
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className={`text-2xl ${achievement.earned ? '' : 'grayscale opacity-50'}`}>
              {achievement.icon}
            </div>
            <div className="flex-1">
              <h4 className={`font-medium ${achievement.earned ? 'text-green-900' : 'text-gray-700'}`}>
                {achievement.title}
              </h4>
              <p className={`text-sm ${achievement.earned ? 'text-green-700' : 'text-gray-600'}`}>
                {achievement.description}
              </p>
              {achievement.earned && (
                <Badge variant="success" className="mt-2">Earned</Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
