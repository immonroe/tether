'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { AchievementSystem } from '@/components/progress/AchievementSystem';
import { StudyStatistics } from '@/components/progress/StudyStatistics';
import { LearningPath } from '@/components/progress/LearningPath';
import { Achievement, LearningPath as LearningPathType } from '@/lib/types';

// Mock data
const mockAchievements: Achievement[] = [
  { id: '1', title: "First Steps", description: "Complete your first AI tutoring session", earned: true, icon: "🎯" },
  { id: '2', title: "Flashcard Master", description: "Create 10 flashcards", earned: true, icon: "📚" },
  { id: '3', title: "Study Streak", description: "Study for 7 days in a row", earned: false, icon: "🔥" },
  { id: '4', title: "Group Contributor", description: "Participate in 5 study group sessions", earned: false, icon: "👥" },
];

const mockLearningPaths: LearningPathType[] = [
  { id: '1', title: "Calculus Fundamentals", description: "Master the basics of calculus", status: "completed", progress: 100, totalConcepts: 24, completedConcepts: 24 },
  { id: '2', title: "Advanced Derivatives", description: "Deep dive into derivative techniques", status: "in-progress", progress: 53, totalConcepts: 15, completedConcepts: 8 },
  { id: '3', title: "Integration Techniques", description: "Learn various integration methods", status: "locked", progress: 0, totalConcepts: 20, completedConcepts: 0 },
  { id: '4', title: "Differential Equations", description: "Solve differential equations", status: "locked", progress: 0, totalConcepts: 18, completedConcepts: 0 },
];

export default function ProgressPage() {
  const [achievements] = useState<Achievement[]>(mockAchievements);
  const [learningPaths] = useState<LearningPathType[]>(mockLearningPaths);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Your Progress</h2>
        <p className="text-gray-600">Track your learning journey and achievements</p>
      </div>

      {/* Achievement System */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
        <AchievementSystem achievements={achievements} />
      </Card>

      {/* Learning Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Statistics</h3>
          <StudyStatistics
            weeklyGoal={10}
            weeklyProgress={8.5}
            cardsReviewed={156}
            accuracyRate={89}
            groupSessions={12}
            dayStreak={7}
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Path</h3>
          <LearningPath paths={learningPaths} />
        </Card>
      </div>

      {/* Study Calendar */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Calendar</h3>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }, (_, i) => {
            const dayNumber = i - 6; // Adjust for calendar start
            const isCurrentMonth = dayNumber > 0 && dayNumber <= 30;
            const hasActivity = isCurrentMonth && Math.random() > 0.6;
            const activityLevel = hasActivity ? Math.floor(Math.random() * 4) + 1 : 0;
            
            return (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center text-sm rounded ${
                  isCurrentMonth
                    ? activityLevel === 0
                      ? 'bg-gray-100 text-gray-400'
                      : activityLevel === 1
                      ? 'bg-green-100 text-green-800'
                      : activityLevel === 2
                      ? 'bg-green-200 text-green-800'
                      : activityLevel === 3
                      ? 'bg-green-400 text-white'
                      : 'bg-green-600 text-white'
                    : 'text-gray-300'
                }`}
              >
                {isCurrentMonth ? dayNumber : ''}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>Less</span>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-100 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
          </div>
          <span>More</span>
        </div>
      </Card>
    </div>
  );
}
