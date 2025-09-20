'use client';
/**
 * @fileoverview Study groups discovery and management page
 * 
 * This file is part of the Tether AI learning platform.
 * study groups discovery and management page for the application.
 */


import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StudyGroupList } from '@/components/study-groups/StudyGroupList';
import { SuggestedGroups } from '@/components/study-groups/SuggestedGroups';
import { StudyGroup } from '@/lib/types';

// Mock data
const mockStudyGroups: StudyGroup[] = [
  { id: '1', name: "Calculus Study Crew", members: 3, subject: "Mathematics", nextSession: "Today 3:00 PM", status: "active" },
  { id: '2', name: "Physics Problem Solvers", members: 2, subject: "Physics", nextSession: "Tomorrow 7:00 PM", status: "pending" },
];

const mockSuggestedGroups = [
  { id: '3', name: "Advanced Physics", description: "Focus on quantum mechanics and thermodynamics", members: 2, maxMembers: 3, level: "Intermediate", isNew: true },
  { id: '4', name: "Data Science Beginners", description: "Learn Python, statistics, and machine learning together", members: 1, maxMembers: 3, level: "Beginner", matchPercentage: 95 },
];

export default function GroupsPage() {
  const [studyGroups] = useState<StudyGroup[]>(mockStudyGroups);

  const handleJoinGroup = (groupId: string) => {
    console.log('Join group:', groupId);
    // TODO: Implement join group logic
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Study Groups</h2>
          <p className="text-gray-600">Learn together with peers who share your interests</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Find Group
        </Button>
      </div>

      {/* Active Groups */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Study Groups</h3>
        <StudyGroupList groups={studyGroups} onJoin={handleJoinGroup} />
      </Card>

      {/* Suggested Groups */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Groups</h3>
        <SuggestedGroups groups={mockSuggestedGroups} onJoin={handleJoinGroup} />
      </Card>
    </div>
  );
}
