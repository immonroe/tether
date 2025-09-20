/**
 * @fileoverview Tests for matching service
 * 
 * This file is part of the Tether AI learning platform.
 * Tests for the user matching algorithm.
 */

import { matchingService } from '../matchingService';
import { UserPreferences, MatchingCriteria } from '@/lib/types';

// Sample test data
const sampleUser1: UserPreferences = {
  id: '1',
  userId: 'user1',
  subjects: ['Mathematics', 'Programming'],
  skillLevel: 'intermediate',
  learningGoals: ['Pass an exam', 'Learn a new skill'],
  availability: {
    timezone: 'America/New_York',
    preferredTimes: ['Evening (5-8 PM)', 'Night (8-11 PM)'],
    daysOfWeek: [1, 2, 3, 4, 5] // Monday to Friday
  },
  groupSize: { min: 2, max: 4 },
  learningStyle: 'visual',
  studyFrequency: 'weekly',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const sampleUser2: UserPreferences = {
  id: '2',
  userId: 'user2',
  subjects: ['Mathematics', 'Science'],
  skillLevel: 'intermediate',
  learningGoals: ['Pass an exam', 'Career advancement'],
  availability: {
    timezone: 'America/New_York',
    preferredTimes: ['Evening (5-8 PM)'],
    daysOfWeek: [1, 3, 5] // Monday, Wednesday, Friday
  },
  groupSize: { min: 2, max: 3 },
  learningStyle: 'mixed',
  studyFrequency: 'weekly',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const sampleUser3: UserPreferences = {
  id: '3',
  userId: 'user3',
  subjects: ['Programming', 'Art'],
  skillLevel: 'beginner',
  learningGoals: ['Learn a new skill'],
  availability: {
    timezone: 'Europe/London',
    preferredTimes: ['Morning (9-12 PM)'],
    daysOfWeek: [6, 0] // Saturday, Sunday
  },
  groupSize: { min: 2, max: 5 },
  learningStyle: 'kinesthetic',
  studyFrequency: 'bi-weekly',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const sampleCriteria: MatchingCriteria = {
  subject: 'Mathematics',
  skillLevel: 'intermediate',
  availability: {
    timezone: 'America/New_York',
    preferredTimes: ['Evening (5-8 PM)'],
    daysOfWeek: [1, 2, 3, 4, 5]
  },
  learningGoals: ['Pass an exam'],
  groupSize: { min: 2, max: 4 },
  learningStyle: 'visual',
};

describe('MatchingService', () => {
  describe('calculateMatchScore', () => {
    it('should calculate high match score for compatible users', () => {
      const match = matchingService['calculateMatchScore'](sampleUser1, sampleUser2, sampleCriteria);
      
      expect(match.matchScore).toBeGreaterThan(70);
      expect(match.matchingFactors.subject).toBe(true);
      expect(match.matchingFactors.skillLevel).toBe(true);
      expect(match.matchingFactors.availability).toBe(true);
    });

    it('should calculate low match score for incompatible users', () => {
      const match = matchingService['calculateMatchScore'](sampleUser1, sampleUser3, sampleCriteria);
      
      expect(match.matchScore).toBeLessThan(50);
      expect(match.matchingFactors.subject).toBe(false);
      expect(match.matchingFactors.availability).toBe(false);
    });
  });

  describe('findMatches', () => {
    it('should find matches for a user', async () => {
      const allUsers = [
        { ...sampleUser2, name: 'User 2' },
        { ...sampleUser3, name: 'User 3' },
      ];

      const matches = await matchingService.findMatches(
        sampleUser1,
        allUsers,
        sampleCriteria,
        5
      );

      expect(matches).toHaveLength(1);
      expect(matches[0].userId).toBe('user2');
      expect(matches[0].matchScore).toBeGreaterThan(30);
    });

    it('should return empty array when no matches found', async () => {
      const allUsers = [
        { ...sampleUser3, name: 'User 3' },
      ];

      const matches = await matchingService.findMatches(
        sampleUser1,
        allUsers,
        sampleCriteria,
        5
      );

      expect(matches).toHaveLength(0);
    });
  });

  describe('findGroupMatches', () => {
    it('should find compatible groups', async () => {
      const users = [sampleUser1, sampleUser2];
      const groupSize = { min: 2, max: 3 };

      const groups = await matchingService.findGroupMatches(
        users,
        sampleCriteria,
        groupSize
      );

      expect(groups.length).toBeGreaterThan(0);
      expect(groups[0]).toHaveLength(2);
    });
  });
});

// Manual test function for development
export function runMatchingTests() {
  console.log('Running matching algorithm tests...');
  
  // Test 1: High compatibility match
  const match1 = matchingService['calculateMatchScore'](sampleUser1, sampleUser2, sampleCriteria);
  console.log('Test 1 - High compatibility:', {
    matchScore: match1.matchScore,
    factors: match1.matchingFactors
  });

  // Test 2: Low compatibility match
  const match2 = matchingService['calculateMatchScore'](sampleUser1, sampleUser3, sampleCriteria);
  console.log('Test 2 - Low compatibility:', {
    matchScore: match2.matchScore,
    factors: match2.matchingFactors
  });

  // Test 3: Find matches
  const allUsers = [
    { ...sampleUser2, name: 'User 2' },
    { ...sampleUser3, name: 'User 3' },
  ];

  matchingService.findMatches(sampleUser1, allUsers, sampleCriteria, 5)
    .then(matches => {
      console.log('Test 3 - Found matches:', matches.map(m => ({
        userId: m.userId,
        matchScore: m.matchScore
      })));
    });

  console.log('Matching tests completed!');
}
