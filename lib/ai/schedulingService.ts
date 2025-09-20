/**
 * @fileoverview Scheduling service for flashcard study sessions
 * 
 * This file is part of the Tether AI learning platform.
 * Handles intelligent scheduling of flashcard study sessions based on user patterns and SM-2 algorithm.
 */

import { Flashcard } from '../types';
import { sm2Service } from './sm2Service';
import { notificationService, StudySchedule, NotificationSettings } from './notificationService';

export interface StudySessionPlan {
  id: string;
  userId: string;
  deckId: string;
  scheduledFor: Date;
  estimatedDuration: number; // in minutes
  cardIds: string[];
  priority: 'high' | 'medium' | 'low';
  sessionType: 'review' | 'new_cards' | 'mixed' | 'catch_up';
  difficulty: 'easy' | 'medium' | 'hard';
  goals: {
    targetCards: number;
    targetAccuracy: number;
    targetTime: number;
  };
}

export interface UserStudyPattern {
  userId: string;
  preferredStudyTimes: string[]; // HH:MM format
  preferredStudyDays: number[]; // 0-6 (Sunday-Saturday)
  averageSessionDuration: number; // in minutes
  averageCardsPerSession: number;
  studyStreak: number;
  lastStudyDate?: Date;
  studyFrequency: 'daily' | 'weekly' | 'custom';
  optimalStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface StudyRecommendation {
  type: 'schedule' | 'reminder' | 'break' | 'intensive';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  suggestedTime?: Date;
  estimatedDuration?: number;
  reason: string;
}

export class SchedulingService {
  private studyPatterns: Map<string, UserStudyPattern> = new Map();
  private sessionPlans: StudySessionPlan[] = [];

  constructor() {
    this.loadStudyPatterns();
    this.loadSessionPlans();
  }

  /**
   * Initialize scheduling service
   */
  async initialize(): Promise<void> {
    await notificationService.initialize();
    this.scheduleOptimalStudySessions();
  }

  /**
   * Create or update user study pattern
   */
  updateStudyPattern(userId: string, pattern: Partial<UserStudyPattern>): void {
    const existingPattern = this.studyPatterns.get(userId) || this.getDefaultStudyPattern(userId);
    const updatedPattern = { ...existingPattern, ...pattern };
    this.studyPatterns.set(userId, updatedPattern);
    this.saveStudyPatterns();
  }

  /**
   * Get user study pattern
   */
  getStudyPattern(userId: string): UserStudyPattern {
    return this.studyPatterns.get(userId) || this.getDefaultStudyPattern(userId);
  }

  /**
   * Get default study pattern for new users
   */
  private getDefaultStudyPattern(userId: string): UserStudyPattern {
    return {
      userId,
      preferredStudyTimes: ['09:00', '18:00'],
      preferredStudyDays: [1, 2, 3, 4, 5], // Monday to Friday
      averageSessionDuration: 15,
      averageCardsPerSession: 10,
      studyStreak: 0,
      studyFrequency: 'daily',
      optimalStudyTime: 'evening'
    };
  }

  /**
   * Schedule optimal study sessions based on user patterns and due cards
   */
  scheduleOptimalStudySessions(): void {
    this.studyPatterns.forEach((pattern, userId) => {
      this.createStudySessionPlan(userId, pattern);
    });
  }

  /**
   * Create a study session plan for a user
   */
  private createStudySessionPlan(userId: string, pattern: UserStudyPattern): StudySessionPlan {
    const flashcards = this.getUserFlashcards(userId); // This would typically fetch from database
    const dueCards = sm2Service.getDueFlashcards(flashcards);
    const newCards = sm2Service.getNewFlashcards(flashcards);
    
    // Determine session type and priority
    const sessionType = this.determineSessionType(dueCards, newCards, pattern);
    const priority = this.calculatePriority(dueCards, newCards, pattern);
    
    // Calculate optimal time
    const scheduledFor = this.calculateOptimalTime(pattern);
    
    // Determine cards to include
    const cardIds = this.selectCardsForSession(dueCards, newCards, pattern, sessionType);
    
    // Calculate estimated duration
    const estimatedDuration = this.calculateSessionDuration(cardIds.length, pattern);
    
    const plan: StudySessionPlan = {
      id: `plan_${userId}_${Date.now()}`,
      userId,
      deckId: 'default', // This would be determined based on user's active deck
      scheduledFor,
      estimatedDuration,
      cardIds,
      priority,
      sessionType,
      difficulty: this.calculateSessionDifficulty(cardIds, flashcards),
      goals: {
        targetCards: cardIds.length,
        targetAccuracy: this.calculateTargetAccuracy(pattern),
        targetTime: estimatedDuration
      }
    };

    this.sessionPlans.push(plan);
    this.saveSessionPlans();
    
    // Create notification schedule
    notificationService.createStudySchedule(flashcards, 'default', userId);
    
    return plan;
  }

  /**
   * Determine the type of study session needed
   */
  private determineSessionType(dueCards: Flashcard[], newCards: Flashcard[], pattern: UserStudyPattern): StudySessionPlan['sessionType'] {
    const dueCount = dueCards.length;
    const newCount = newCards.length;
    
    if (dueCount > 15) return 'catch_up';
    if (dueCount > 5 && newCount > 0) return 'mixed';
    if (dueCount > 0) return 'review';
    if (newCount > 0) return 'new_cards';
    
    return 'review';
  }

  /**
   * Calculate session priority
   */
  private calculatePriority(dueCards: Flashcard[], newCards: Flashcard[], pattern: UserStudyPattern): 'high' | 'medium' | 'low' {
    const dueCount = dueCards.length;
    const daysSinceLastStudy = pattern.lastStudyDate 
      ? Math.floor((Date.now() - pattern.lastStudyDate.getTime()) / (1000 * 60 * 60 * 24))
      : 7;
    
    if (dueCount > 10 || daysSinceLastStudy > 3) return 'high';
    if (dueCount > 5 || daysSinceLastStudy > 1) return 'medium';
    return 'low';
  }

  /**
   * Calculate optimal study time based on user pattern
   */
  private calculateOptimalTime(pattern: UserStudyPattern): Date {
    const now = new Date();
    const [hours, minutes] = pattern.preferredStudyTimes[0].split(':').map(Number);
    
    let nextTime = new Date(now);
    nextTime.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, move to next preferred day
    if (nextTime <= now) {
      nextTime.setDate(nextTime.getDate() + 1);
    }
    
    // Find next day that matches user's preferred days
    while (!pattern.preferredStudyDays.includes(nextTime.getDay())) {
      nextTime.setDate(nextTime.getDate() + 1);
    }
    
    return nextTime;
  }

  /**
   * Select cards for the study session
   */
  private selectCardsForSession(
    dueCards: Flashcard[], 
    newCards: Flashcard[], 
    pattern: UserStudyPattern,
    sessionType: StudySessionPlan['sessionType']
  ): string[] {
    const maxCards = Math.min(pattern.averageCardsPerSession, 20);
    let selectedCards: string[] = [];
    
    switch (sessionType) {
      case 'review':
        selectedCards = dueCards.slice(0, maxCards).map(card => card.id);
        break;
      case 'new_cards':
        selectedCards = newCards.slice(0, maxCards).map(card => card.id);
        break;
      case 'mixed':
        const dueCount = Math.min(Math.ceil(maxCards * 0.7), dueCards.length);
        const newCount = Math.min(maxCards - dueCount, newCards.length);
        selectedCards = [
          ...dueCards.slice(0, dueCount).map(card => card.id),
          ...newCards.slice(0, newCount).map(card => card.id)
        ];
        break;
      case 'catch_up':
        selectedCards = dueCards.slice(0, maxCards).map(card => card.id);
        break;
    }
    
    return selectedCards;
  }

  /**
   * Calculate session duration based on card count and user pattern
   */
  private calculateSessionDuration(cardCount: number, pattern: UserStudyPattern): number {
    const baseTimePerCard = pattern.averageSessionDuration / pattern.averageCardsPerSession;
    return Math.ceil(cardCount * baseTimePerCard);
  }

  /**
   * Calculate session difficulty
   */
  private calculateSessionDifficulty(cardIds: string[], allFlashcards: Flashcard[]): 'easy' | 'medium' | 'hard' {
    const cards = allFlashcards.filter(card => cardIds.includes(card.id));
    const avgDifficulty = cards.reduce((sum, card) => {
      const difficultyValue = card.difficulty === 'easy' ? 1 : card.difficulty === 'medium' ? 2 : 3;
      return sum + difficultyValue;
    }, 0) / cards.length;
    
    if (avgDifficulty <= 1.3) return 'easy';
    if (avgDifficulty <= 2.3) return 'medium';
    return 'hard';
  }

  /**
   * Calculate target accuracy based on user pattern
   */
  private calculateTargetAccuracy(pattern: UserStudyPattern): number {
    // Base accuracy on user's study streak and frequency
    const streakBonus = Math.min(pattern.studyStreak * 0.5, 10);
    const frequencyBonus = pattern.studyFrequency === 'daily' ? 5 : 0;
    return Math.min(70 + streakBonus + frequencyBonus, 95);
  }

  /**
   * Get study recommendations for a user
   */
  getStudyRecommendations(userId: string): StudyRecommendation[] {
    const pattern = this.getStudyPattern(userId);
    const flashcards = this.getUserFlashcards(userId);
    const dueCards = sm2Service.getDueFlashcards(flashcards);
    const recommendations: StudyRecommendation[] = [];
    
    // Due cards recommendation
    if (dueCards.length > 0) {
      recommendations.push({
        type: 'schedule',
        title: `${dueCards.length} Cards Due for Review`,
        message: `You have ${dueCards.length} flashcards ready for review. Schedule a study session to maintain your progress.`,
        priority: dueCards.length > 10 ? 'high' : 'medium',
        suggestedTime: this.calculateOptimalTime(pattern),
        estimatedDuration: this.calculateSessionDuration(dueCards.length, pattern),
        reason: 'due_cards'
      });
    }
    
    // Streak maintenance recommendation
    if (pattern.studyStreak > 0) {
      const daysSinceLastStudy = pattern.lastStudyDate 
        ? Math.floor((Date.now() - pattern.lastStudyDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      if (daysSinceLastStudy >= 1) {
        recommendations.push({
          type: 'reminder',
          title: 'Maintain Your Study Streak',
          message: `You're on a ${pattern.studyStreak}-day streak! Don't break it by studying today.`,
          priority: 'high',
          reason: 'streak_maintenance'
        });
      }
    }
    
    // Break recommendation
    if (pattern.studyStreak > 7) {
      recommendations.push({
        type: 'break',
        title: 'Consider a Study Break',
        message: 'You\'ve been studying for 7+ days straight. Consider taking a short break to avoid burnout.',
        priority: 'low',
        reason: 'burnout_prevention'
      });
    }
    
    // Intensive study recommendation
    if (dueCards.length > 20) {
      recommendations.push({
        type: 'intensive',
        title: 'Intensive Study Session Recommended',
        message: 'You have many cards due. Consider scheduling a longer study session to catch up.',
        priority: 'high',
        suggestedTime: this.calculateOptimalTime(pattern),
        estimatedDuration: this.calculateSessionDuration(dueCards.length, pattern),
        reason: 'catch_up_needed'
      });
    }
    
    return recommendations;
  }

  /**
   * Get upcoming study sessions for a user
   */
  getUpcomingSessions(userId: string): StudySessionPlan[] {
    const now = new Date();
    return this.sessionPlans
      .filter(plan => plan.userId === userId && plan.scheduledFor > now)
      .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
  }

  /**
   * Mark a study session as completed
   */
  markSessionCompleted(sessionId: string, actualDuration: number, actualAccuracy: number): void {
    const session = this.sessionPlans.find(plan => plan.id === sessionId);
    if (session) {
      // Update user study pattern based on actual performance
      const pattern = this.getStudyPattern(session.userId);
      this.updateStudyPattern(session.userId, {
        lastStudyDate: new Date(),
        studyStreak: pattern.studyStreak + 1,
        averageSessionDuration: (pattern.averageSessionDuration + actualDuration) / 2,
        averageCardsPerSession: (pattern.averageCardsPerSession + session.cardIds.length) / 2
      });
      
      // Remove completed session
      this.sessionPlans = this.sessionPlans.filter(plan => plan.id !== sessionId);
      this.saveSessionPlans();
    }
  }

  /**
   * Reschedule a study session
   */
  rescheduleSession(sessionId: string, newTime: Date): void {
    const session = this.sessionPlans.find(plan => plan.id === sessionId);
    if (session) {
      session.scheduledFor = newTime;
      this.saveSessionPlans();
    }
  }

  /**
   * Get user flashcards (placeholder implementation)
   */
  private getUserFlashcards(userId: string): Flashcard[] {
    // This would typically fetch from the database
    // For now, return empty array
    return [];
  }

  /**
   * Save study patterns to localStorage
   */
  private saveStudyPatterns(): void {
    if (typeof window !== 'undefined') {
      try {
        const patternsArray = Array.from(this.studyPatterns.values());
        localStorage.setItem('study-patterns', JSON.stringify(patternsArray));
      } catch (error) {
        console.error('Error saving study patterns:', error);
      }
    }
  }

  /**
   * Load study patterns from localStorage
   */
  private loadStudyPatterns(): void {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('study-patterns');
        if (saved) {
          const patterns = JSON.parse(saved);
          patterns.forEach((pattern: UserStudyPattern) => {
            this.studyPatterns.set(pattern.userId, {
              ...pattern,
              lastStudyDate: pattern.lastStudyDate ? new Date(pattern.lastStudyDate) : undefined
            });
          });
        }
      } catch (error) {
        console.error('Error loading study patterns:', error);
      }
    }
  }

  /**
   * Save session plans to localStorage
   */
  private saveSessionPlans(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('session-plans', JSON.stringify(this.sessionPlans));
      } catch (error) {
        console.error('Error saving session plans:', error);
      }
    }
  }

  /**
   * Load session plans from localStorage
   */
  private loadSessionPlans(): void {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('session-plans');
        if (saved) {
          this.sessionPlans = JSON.parse(saved).map((plan: any) => ({
            ...plan,
            scheduledFor: new Date(plan.scheduledFor)
          }));
        }
      } catch (error) {
        console.error('Error loading session plans:', error);
      }
    }
  }

  /**
   * Get scheduling statistics
   */
  getSchedulingStats(): {
    totalPlans: number;
    upcomingPlans: number;
    completedPlans: number;
    averageSessionDuration: number;
    mostActiveUser: string | null;
  } {
    const now = new Date();
    const upcomingPlans = this.sessionPlans.filter(plan => plan.scheduledFor > now);
    const completedPlans = this.sessionPlans.filter(plan => plan.scheduledFor <= now);
    
    const averageDuration = this.sessionPlans.length > 0
      ? this.sessionPlans.reduce((sum, plan) => sum + plan.estimatedDuration, 0) / this.sessionPlans.length
      : 0;
    
    // Find most active user
    const userActivity = new Map<string, number>();
    this.sessionPlans.forEach(plan => {
      userActivity.set(plan.userId, (userActivity.get(plan.userId) || 0) + 1);
    });
    
    const mostActiveUser = userActivity.size > 0 
      ? Array.from(userActivity.entries()).reduce((a, b) => a[1] > b[1] ? a : b)[0]
      : null;
    
    return {
      totalPlans: this.sessionPlans.length,
      upcomingPlans: upcomingPlans.length,
      completedPlans: completedPlans.length,
      averageSessionDuration: Math.round(averageDuration),
      mostActiveUser
    };
  }
}

// Export singleton instance
export const schedulingService = new SchedulingService();
