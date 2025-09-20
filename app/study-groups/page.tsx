'use client';
/**
 * @fileoverview Study groups page with matching functionality
 * 
 * This file is part of the Tether AI learning platform.
 * Main study groups page with user matching algorithm.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { 
  StudyGroupList, 
  SuggestedGroups, 
  UserPreferencesForm, 
  MatchingResults 
} from '@/components/study-groups';
import { UserPreferences, UserMatch, MatchingCriteria } from '@/lib/types';
import { userPreferencesService } from '@/lib/ai/userPreferencesService';
import { matchingService } from '@/lib/ai/matchingService';
import { useAuthStore } from '@/stores/auth';
import { Users, Settings, Search } from 'lucide-react';

export default function StudyGroupsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('browse');
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [matches, setMatches] = useState<UserMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreferencesForm, setShowPreferencesForm] = useState(false);

  // Load user preferences on component mount
  useEffect(() => {
    if (user?.id) {
      loadUserPreferences();
    }
  }, [user?.id]);

  const loadUserPreferences = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const preferences = await userPreferencesService.getUserPreferences(user.id);
      setUserPreferences(preferences);
      
      if (!preferences) {
        setShowPreferencesForm(true);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async (preferences: Omit<UserPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const savedPreferences = await userPreferencesService.saveUserPreferences(user.id, preferences);
      if (savedPreferences) {
        setUserPreferences(savedPreferences);
        setShowPreferencesForm(false);
        // Automatically find matches after saving preferences
        await findMatches();
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const findMatches = async () => {
    if (!user?.id || !userPreferences) return;

    setIsLoading(true);
    try {
      // Get all users with preferences
      const allUsers = await userPreferencesService.getAllUsersWithPreferences();
      
      // Create matching criteria based on user preferences
      const criteria: MatchingCriteria = {
        subject: userPreferences.subjects[0] || 'General',
        skillLevel: userPreferences.skillLevel,
        availability: userPreferences.availability,
        learningGoals: userPreferences.learningGoals,
        groupSize: userPreferences.groupSize,
        learningStyle: userPreferences.learningStyle,
      };

      // Find matches
      const foundMatches = await matchingService.findMatches(
        userPreferences,
        allUsers,
        criteria,
        10
      );

      setMatches(foundMatches);
    } catch (error) {
      console.error('Error finding matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGroup = (groupId: string) => {
    // TODO: Implement join group functionality
    console.log('Joining group:', groupId);
  };

  const handleInviteUser = (userId: string) => {
    // TODO: Implement invite user functionality
    console.log('Inviting user:', userId);
  };

  const handleViewProfile = (userId: string) => {
    // TODO: Implement view profile functionality
    console.log('Viewing profile:', userId);
  };

  // Mock data for existing groups
  const mockGroups = [
    {
      id: '1',
      name: 'Advanced Mathematics Study Group',
      members: 3,
      subject: 'Mathematics',
      nextSession: 'Tomorrow at 7 PM',
      status: 'active' as const,
      description: 'Working through calculus and linear algebra problems',
      maxMembers: 4,
    },
    {
      id: '2',
      name: 'Python Programming Beginners',
      members: 2,
      subject: 'Programming',
      nextSession: 'Friday at 6 PM',
      status: 'pending' as const,
      description: 'Learning Python fundamentals together',
      maxMembers: 3,
    },
  ];

  // Mock data for suggested groups
  const mockSuggestedGroups = [
    {
      id: '3',
      name: 'Data Science Study Group',
      description: 'Exploring machine learning and statistics',
      members: 1,
      maxMembers: 4,
      level: 'Intermediate',
      matchPercentage: 85,
      isNew: true,
    },
    {
      id: '4',
      name: 'Web Development Bootcamp',
      description: 'Full-stack development with React and Node.js',
      members: 2,
      maxMembers: 5,
      level: 'Beginner',
      matchPercentage: 72,
      isNew: false,
    },
  ];

  if (showPreferencesForm) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Group Preferences</h1>
          <p className="text-gray-600">
            Set up your preferences to find the perfect study partners and groups.
          </p>
        </div>
        
        <UserPreferencesForm
          onSubmit={handleSavePreferences}
          isLoading={isLoading}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Groups</h1>
            <p className="text-gray-600">
              Find study partners and join collaborative learning sessions.
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowPreferencesForm(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Update Preferences
            </Button>
            <Button onClick={findMatches} disabled={isLoading}>
              <Search className="w-4 h-4 mr-2" />
              Find Matches
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'browse', label: 'Browse Groups', icon: Users },
          { id: 'matches', label: 'Find Partners', icon: Search },
          { id: 'suggested', label: 'Suggested', icon: Users },
        ]}
      />

      <div className="mt-6">
        {activeTab === 'browse' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Study Groups</h2>
            <StudyGroupList groups={mockGroups} onJoin={handleJoinGroup} />
          </div>
        )}

        {activeTab === 'matches' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Potential Study Partners</h2>
            <MatchingResults
              matches={matches}
              onInvite={handleInviteUser}
              onViewProfile={handleViewProfile}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeTab === 'suggested' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Suggested Groups</h2>
            <SuggestedGroups groups={mockSuggestedGroups} onJoin={handleJoinGroup} />
          </div>
        )}
      </div>
    </div>
  );
}
