/**
 * @fileoverview User matching service for study groups
 * 
 * This file is part of the Tether AI learning platform.
 * Implements user matching algorithm based on preferences for study groups.
 */

import { UserPreferences, MatchingCriteria, UserMatch } from '@/lib/types';

export class MatchingService {
  /**
   * Calculate match score between two users based on their preferences
   */
  private calculateMatchScore(
    user1: UserPreferences,
    user2: UserPreferences,
    criteria: MatchingCriteria
  ): UserMatch {
    let totalScore = 0;
    let maxScore = 0;
    const matchingFactors = {
      subject: false,
      skillLevel: false,
      availability: false,
      learningGoals: 0,
      learningStyle: false,
    };

    // Subject matching (weight: 30%)
    const subjectWeight = 30;
    maxScore += subjectWeight;
    if (this.hasSubjectMatch(user1.subjects, user2.subjects, criteria.subject)) {
      totalScore += subjectWeight;
      matchingFactors.subject = true;
    }

    // Skill level matching (weight: 25%)
    const skillWeight = 25;
    maxScore += skillWeight;
    if (this.hasSkillLevelMatch(user1.skillLevel, user2.skillLevel, criteria.skillLevel)) {
      totalScore += skillWeight;
      matchingFactors.skillLevel = true;
    }

    // Availability matching (weight: 20%)
    const availabilityWeight = 20;
    maxScore += availabilityWeight;
    if (this.hasAvailabilityMatch(user1.availability, user2.availability, criteria.availability)) {
      totalScore += availabilityWeight;
      matchingFactors.availability = true;
    }

    // Learning goals matching (weight: 15%)
    const goalsWeight = 15;
    maxScore += goalsWeight;
    const matchingGoals = this.getMatchingGoals(user1.learningGoals, user2.learningGoals, criteria.learningGoals);
    const goalsScore = (matchingGoals / Math.max(user1.learningGoals.length, user2.learningGoals.length, 1)) * goalsWeight;
    totalScore += goalsScore;
    matchingFactors.learningGoals = matchingGoals;

    // Learning style matching (weight: 10%)
    const styleWeight = 10;
    maxScore += styleWeight;
    if (this.hasLearningStyleMatch(user1.learningStyle, user2.learningStyle, criteria.learningStyle)) {
      totalScore += styleWeight;
      matchingFactors.learningStyle = true;
    }

    const matchScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return {
      userId: user2.userId,
      name: '', // Will be populated by caller
      matchScore,
      matchingFactors,
      preferences: user2,
    };
  }

  /**
   * Check if users have matching subjects
   */
  private hasSubjectMatch(
    subjects1: string[],
    subjects2: string[],
    targetSubject: string
  ): boolean {
    // Check if both users have the target subject
    const hasTargetSubject = subjects1.includes(targetSubject) && subjects2.includes(targetSubject);
    
    // Also check for any overlapping subjects
    const hasOverlap = subjects1.some(subject => subjects2.includes(subject));
    
    return hasTargetSubject || hasOverlap;
  }

  /**
   * Check if users have compatible skill levels
   */
  private hasSkillLevelMatch(
    level1: string,
    level2: string,
    targetLevel: string
  ): boolean {
    // Exact match is best
    if (level1 === level2 && level1 === targetLevel) {
      return true;
    }

    // Adjacent levels are acceptable (beginner-intermediate, intermediate-advanced)
    const levels = ['beginner', 'intermediate', 'advanced'];
    const index1 = levels.indexOf(level1);
    const index2 = levels.indexOf(level2);
    const targetIndex = levels.indexOf(targetLevel);

    // Both users should be within one level of the target
    const withinTargetRange = Math.abs(index1 - targetIndex) <= 1 && Math.abs(index2 - targetIndex) <= 1;
    
    // Users should be within one level of each other
    const withinEachOther = Math.abs(index1 - index2) <= 1;

    return withinTargetRange && withinEachOther;
  }

  /**
   * Check if users have compatible availability
   */
  private hasAvailabilityMatch(
    availability1: UserPreferences['availability'],
    availability2: UserPreferences['availability'],
    targetAvailability: MatchingCriteria['availability']
  ): boolean {
    // Check timezone compatibility (allow same timezone or adjacent ones)
    const timezoneMatch = this.isTimezoneCompatible(
      availability1.timezone,
      availability2.timezone,
      targetAvailability.timezone
    );

    // Check for overlapping preferred times
    const timeMatch = this.hasTimeOverlap(
      availability1.preferredTimes,
      availability2.preferredTimes,
      targetAvailability.preferredTimes
    );

    // Check for overlapping days
    const dayMatch = this.hasDayOverlap(
      availability1.daysOfWeek,
      availability2.daysOfWeek,
      targetAvailability.daysOfWeek
    );

    return timezoneMatch && (timeMatch || dayMatch);
  }

  /**
   * Check timezone compatibility
   */
  private isTimezoneCompatible(tz1: string, tz2: string, targetTz: string): boolean {
    // For now, require exact timezone match or allow UTC as fallback
    return tz1 === tz2 || tz1 === 'UTC' || tz2 === 'UTC' || tz1 === targetTz || tz2 === targetTz;
  }

  /**
   * Check for overlapping preferred times
   */
  private hasTimeOverlap(times1: string[], times2: string[], targetTimes: string[]): boolean {
    const allTimes = [...times1, ...times2, ...targetTimes];
    const uniqueTimes = [...new Set(allTimes)];
    return uniqueTimes.length < allTimes.length;
  }

  /**
   * Check for overlapping days
   */
  private hasDayOverlap(days1: number[], days2: number[], targetDays: number[]): boolean {
    const allDays = [...days1, ...days2, ...targetDays];
    const uniqueDays = [...new Set(allDays)];
    return uniqueDays.length < allDays.length;
  }

  /**
   * Get number of matching learning goals
   */
  private getMatchingGoals(
    goals1: string[],
    goals2: string[],
    targetGoals: string[]
  ): number {
    const allGoals = [...goals1, ...goals2, ...targetGoals];
    const uniqueGoals = [...new Set(allGoals)];
    return allGoals.length - uniqueGoals.length;
  }

  /**
   * Check if learning styles are compatible
   */
  private hasLearningStyleMatch(
    style1: string,
    style2: string,
    targetStyle: string
  ): boolean {
    // Exact match is best
    if (style1 === style2 && style1 === targetStyle) {
      return true;
    }

    // Mixed style is compatible with any other style
    if (style1 === 'mixed' || style2 === 'mixed' || targetStyle === 'mixed') {
      return true;
    }

    // Visual and reading are compatible
    if ((style1 === 'visual' && style2 === 'reading') || (style1 === 'reading' && style2 === 'visual')) {
      return true;
    }

    // Auditory and kinesthetic can work together
    if ((style1 === 'auditory' && style2 === 'kinesthetic') || (style1 === 'kinesthetic' && style2 === 'auditory')) {
      return true;
    }

    return false;
  }

  /**
   * Find potential matches for a user based on criteria
   */
  public async findMatches(
    userPreferences: UserPreferences,
    allUsers: Array<UserPreferences & { name: string }>,
    criteria: MatchingCriteria,
    limit: number = 10
  ): Promise<UserMatch[]> {
    // Filter out the user themselves
    const otherUsers = allUsers.filter(user => user.userId !== userPreferences.userId);

    // Calculate match scores for all other users
    const matches = otherUsers.map(user => 
      this.calculateMatchScore(userPreferences, user, criteria)
    );

    // Sort by match score (descending) and return top matches
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit)
      .filter(match => match.matchScore > 30); // Only return matches with >30% compatibility
  }

  /**
   * Find study group matches based on multiple users
   */
  public async findGroupMatches(
    userPreferences: UserPreferences[],
    criteria: MatchingCriteria,
    groupSize: { min: number; max: number }
  ): Promise<UserMatch[][]> {
    const groups: UserMatch[][] = [];
    const usedUsers = new Set<string>();

    // Sort users by their overall compatibility with criteria
    const sortedUsers = userPreferences
      .map(user => ({
        user,
        score: this.calculateCompatibilityWithCriteria(user, criteria)
      }))
      .sort((a, b) => b.score - a.score);

    for (const { user } of sortedUsers) {
      if (usedUsers.has(user.userId)) continue;

      // Find compatible users for this user
      const compatibleUsers = userPreferences
        .filter(u => u.userId !== user.userId && !usedUsers.has(u.userId))
        .map(u => this.calculateMatchScore(user, u, criteria))
        .filter(match => match.matchScore > 50) // Higher threshold for group formation
        .sort((a, b) => b.matchScore - a.matchScore);

      if (compatibleUsers.length >= groupSize.min - 1) {
        // Form a group
        const group: UserMatch[] = [
          {
            userId: user.userId,
            name: '', // Will be populated by caller
            matchScore: 100,
            matchingFactors: {
              subject: true,
              skillLevel: true,
              availability: true,
              learningGoals: user.learningGoals.length,
              learningStyle: true,
            },
            preferences: user,
          },
          ...compatibleUsers.slice(0, groupSize.max - 1)
        ];

        groups.push(group);
        
        // Mark users as used
        group.forEach(member => usedUsers.add(member.userId));
      }
    }

    return groups;
  }

  /**
   * Calculate how well a user matches the overall criteria
   */
  private calculateCompatibilityWithCriteria(
    user: UserPreferences,
    criteria: MatchingCriteria
  ): number {
    let score = 0;
    let maxScore = 0;

    // Subject match
    maxScore += 30;
    if (user.subjects.includes(criteria.subject)) {
      score += 30;
    }

    // Skill level match
    maxScore += 25;
    if (user.skillLevel === criteria.skillLevel) {
      score += 25;
    } else if (this.hasSkillLevelMatch(user.skillLevel, criteria.skillLevel, criteria.skillLevel)) {
      score += 15;
    }

    // Availability match
    maxScore += 20;
    if (this.hasAvailabilityMatch(user.availability, criteria.availability, criteria.availability)) {
      score += 20;
    }

    // Learning goals match
    maxScore += 15;
    const matchingGoals = this.getMatchingGoals(user.learningGoals, criteria.learningGoals, criteria.learningGoals);
    score += (matchingGoals / Math.max(user.learningGoals.length, criteria.learningGoals.length, 1)) * 15;

    // Learning style match
    maxScore += 10;
    if (user.learningStyle === criteria.learningStyle) {
      score += 10;
    } else if (this.hasLearningStyleMatch(user.learningStyle, criteria.learningStyle, criteria.learningStyle)) {
      score += 5;
    }

    return maxScore > 0 ? (score / maxScore) * 100 : 0;
  }
}

export const matchingService = new MatchingService();
