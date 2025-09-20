/**
 * @fileoverview Daily study reminder service
 * 
 * This file is part of the Tether AI learning platform.
 * Handles daily study reminders, streak tracking, and motivation messages.
 */

import { notificationService, StudyReminder } from './notificationService';
import { browserNotificationService } from './browserNotificationService';
import { schedulingService } from './schedulingService';

export interface DailyReminderData {
  userId: string;
  lastReminderDate: string;
  reminderCount: number;
  streakCount: number;
  longestStreak: number;
  totalStudyDays: number;
  lastStudyDate?: string;
  reminderTime: string;
  reminderDays: number[];
  isEnabled: boolean;
}

export interface MotivationMessage {
  type: 'encouragement' | 'achievement' | 'reminder' | 'celebration';
  title: string;
  message: string;
  emoji: string;
  condition: (data: DailyReminderData) => boolean;
}

export class DailyReminderService {
  private static instance: DailyReminderService;
  private reminderData: Map<string, DailyReminderData> = new Map();
  private motivationMessages: MotivationMessage[] = [];
  private reminderInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeMotivationMessages();
    this.loadReminderData();
    this.startReminderScheduler();
  }

  static getInstance(): DailyReminderService {
    if (!DailyReminderService.instance) {
      DailyReminderService.instance = new DailyReminderService();
    }
    return DailyReminderService.instance;
  }

  /**
   * Initialize the daily reminder service
   */
  async initialize(): Promise<void> {
    // Service is already initialized in constructor
    // This method is here for consistency with other services
  }

  /**
   * Initialize motivation messages
   */
  private initializeMotivationMessages(): void {
    this.motivationMessages = [
      // Encouragement messages
      {
        type: 'encouragement',
        title: 'Keep Going!',
        message: 'Every study session brings you closer to your goals. You\'ve got this!',
        emoji: '💪',
        condition: (data) => data.streakCount >= 1 && data.streakCount < 7
      },
      {
        type: 'encouragement',
        title: 'Consistency is Key',
        message: 'You\'re building a great study habit. Keep up the momentum!',
        emoji: '🔥',
        condition: (data) => data.streakCount >= 7 && data.streakCount < 30
      },
      {
        type: 'encouragement',
        title: 'You\'re on Fire!',
        message: 'Your dedication is inspiring. Keep pushing forward!',
        emoji: '🚀',
        condition: (data) => data.streakCount >= 30
      },

      // Achievement messages
      {
        type: 'achievement',
        title: 'First Week Complete!',
        message: 'Congratulations on completing your first week of consistent studying!',
        emoji: '🎉',
        condition: (data) => data.streakCount === 7
      },
      {
        type: 'achievement',
        title: 'Monthly Milestone!',
        message: 'Amazing! You\'ve studied for 30 days straight. That\'s dedication!',
        emoji: '🏆',
        condition: (data) => data.streakCount === 30
      },
      {
        type: 'achievement',
        title: 'New Streak Record!',
        message: 'You\'ve set a new personal record! Keep the momentum going!',
        emoji: '⭐',
        condition: (data) => data.streakCount > data.longestStreak
      },

      // Reminder messages
      {
        type: 'reminder',
        title: 'Don\'t Break the Chain!',
        message: 'You\'re on a great streak. Don\'t let it slip away!',
        emoji: '⛓️',
        condition: (data) => data.streakCount > 0 && this.isLastStudyOver24HoursAgo(data)
      },
      {
        type: 'reminder',
        title: 'Time to Study!',
        message: 'Your daily study session is waiting for you.',
        emoji: '📚',
        condition: (data) => data.streakCount === 0 || this.isLastStudyOver24HoursAgo(data)
      },

      // Celebration messages
      {
        type: 'celebration',
        title: 'Welcome Back!',
        message: 'Great to see you back! Let\'s get back into the study groove.',
        emoji: '👋',
        condition: (data) => data.streakCount === 0 && data.totalStudyDays > 0
      }
    ];
  }

  /**
   * Check if last study was over 24 hours ago
   */
  private isLastStudyOver24HoursAgo(data: DailyReminderData): boolean {
    if (!data.lastStudyDate) return true;
    const lastStudy = new Date(data.lastStudyDate);
    const now = new Date();
    const diffHours = (now.getTime() - lastStudy.getTime()) / (1000 * 60 * 60);
    return diffHours >= 24;
  }

  /**
   * Start the reminder scheduler
   */
  private startReminderScheduler(): void {
    // Check for reminders every minute
    this.reminderInterval = setInterval(() => {
      this.checkAndSendReminders();
    }, 60000);
  }

  /**
   * Check and send reminders
   */
  private async checkAndSendReminders(): Promise<void> {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const currentDay = now.getDay();

    for (const [userId, data] of this.reminderData) {
      if (!data.isEnabled) continue;
      if (!data.reminderDays.includes(currentDay)) continue;
      if (data.reminderTime !== currentTime) continue;
      if (data.lastReminderDate === now.toDateString()) continue; // Already sent today

      await this.sendDailyReminder(userId, data);
    }
  }

  /**
   * Send daily reminder to a user
   */
  private async sendDailyReminder(userId: string, data: DailyReminderData): Promise<void> {
    try {
      // Get motivation message
      const motivationMessage = this.getMotivationMessage(data);
      
      // Create reminder
      const reminder: StudyReminder = {
        id: `daily_${userId}_${Date.now()}`,
        type: 'daily',
        title: motivationMessage.title,
        message: motivationMessage.message,
        scheduledFor: new Date(),
        isRead: false,
        actionUrl: '/flashcards',
        metadata: {
          emoji: motivationMessage.emoji,
          streakCount: data.streakCount,
          totalStudyDays: data.totalStudyDays
        }
      };

      // Add to notification service
      notificationService.scheduleReminder(reminder);

      // Send browser notification if enabled
      if (browserNotificationService.isEnabled()) {
        await browserNotificationService.showStudyReminder(
          `${motivationMessage.emoji} ${motivationMessage.title}`,
          motivationMessage.message,
          '/flashcards'
        );
      }

      // Update reminder data
      data.lastReminderDate = new Date().toDateString();
      data.reminderCount++;
      this.saveReminderData();

      console.log(`Daily reminder sent to user ${userId}`);
    } catch (error) {
      console.error(`Error sending daily reminder to user ${userId}:`, error);
    }
  }

  /**
   * Get appropriate motivation message for user data
   */
  private getMotivationMessage(data: DailyReminderData): MotivationMessage {
    // Find the first message that matches the condition
    const message = this.motivationMessages.find(msg => msg.condition(data));
    return message || this.motivationMessages[0]; // Fallback to first message
  }

  /**
   * Record a study session
   */
  recordStudySession(userId: string): void {
    const data = this.getOrCreateReminderData(userId);
    const today = new Date().toDateString();
    
    // Update streak
    if (data.lastStudyDate === today) {
      // Already studied today, no change to streak
      return;
    }
    
    if (data.lastStudyDate && this.isConsecutiveDay(data.lastStudyDate, today)) {
      data.streakCount++;
    } else {
      data.streakCount = 1;
    }
    
    // Update longest streak
    if (data.streakCount > data.longestStreak) {
      data.longestStreak = data.streakCount;
    }
    
    // Update study data
    data.lastStudyDate = today;
    data.totalStudyDays++;
    
    this.saveReminderData();
    
    // Send streak celebration if applicable
    this.checkStreakCelebration(userId, data);
  }

  /**
   * Check if two dates are consecutive days
   */
  private isConsecutiveDay(date1: string, date2: string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  /**
   * Check for streak celebrations
   */
  private async checkStreakCelebration(userId: string, data: DailyReminderData): Promise<void> {
    const celebrationMilestones = [7, 14, 30, 60, 100];
    
    if (celebrationMilestones.includes(data.streakCount)) {
      const reminder: StudyReminder = {
        id: `celebration_${userId}_${data.streakCount}_${Date.now()}`,
        type: 'streak',
        title: `${data.streakCount}-Day Streak!`,
        message: `Congratulations! You've studied for ${data.streakCount} days straight!`,
        scheduledFor: new Date(),
        isRead: false,
        actionUrl: '/progress',
        metadata: {
          streakCount: data.streakCount,
          isNewRecord: data.streakCount > data.longestStreak
        }
      };

      notificationService.scheduleReminder(reminder);

      // Send browser notification
      if (browserNotificationService.isEnabled()) {
        await browserNotificationService.showStreakReminder(
          data.streakCount,
          data.streakCount > data.longestStreak,
          '/progress'
        );
      }
    }
  }

  /**
   * Get or create reminder data for a user
   */
  private getOrCreateReminderData(userId: string): DailyReminderData {
    if (!this.reminderData.has(userId)) {
      this.reminderData.set(userId, {
        userId,
        lastReminderDate: '',
        reminderCount: 0,
        streakCount: 0,
        longestStreak: 0,
        totalStudyDays: 0,
        reminderTime: '09:00',
        reminderDays: [1, 2, 3, 4, 5], // Monday to Friday
        isEnabled: true
      });
    }
    return this.reminderData.get(userId)!;
  }

  /**
   * Update reminder settings for a user
   */
  updateReminderSettings(userId: string, settings: Partial<DailyReminderData>): void {
    const data = this.getOrCreateReminderData(userId);
    Object.assign(data, settings);
    this.saveReminderData();
  }

  /**
   * Get reminder data for a user
   */
  getReminderData(userId: string): DailyReminderData {
    return this.getOrCreateReminderData(userId);
  }

  /**
   * Get all reminder data
   */
  getAllReminderData(): DailyReminderData[] {
    return Array.from(this.reminderData.values());
  }

  /**
   * Save reminder data to localStorage
   */
  private saveReminderData(): void {
    try {
      const dataArray = Array.from(this.reminderData.values());
      localStorage.setItem('daily-reminder-data', JSON.stringify(dataArray));
    } catch (error) {
      console.error('Error saving reminder data:', error);
    }
  }

  /**
   * Load reminder data from localStorage
   */
  private loadReminderData(): void {
    try {
      const saved = localStorage.getItem('daily-reminder-data');
      if (saved) {
        const dataArray = JSON.parse(saved);
        dataArray.forEach((data: DailyReminderData) => {
          this.reminderData.set(data.userId, data);
        });
      }
    } catch (error) {
      console.error('Error loading reminder data:', error);
    }
  }

  /**
   * Get reminder statistics
   */
  getReminderStats(): {
    totalUsers: number;
    activeUsers: number;
    totalReminders: number;
    averageStreak: number;
    longestStreak: number;
  } {
    const users = Array.from(this.reminderData.values());
    const activeUsers = users.filter(user => user.isEnabled);
    const totalReminders = users.reduce((sum, user) => sum + user.reminderCount, 0);
    const averageStreak = users.length > 0 
      ? users.reduce((sum, user) => sum + user.streakCount, 0) / users.length 
      : 0;
    const longestStreak = Math.max(...users.map(user => user.longestStreak), 0);

    return {
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      totalReminders,
      averageStreak: Math.round(averageStreak * 10) / 10,
      longestStreak
    };
  }

  /**
   * Clean up old reminder data
   */
  cleanupOldData(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    for (const [userId, data] of this.reminderData) {
      if (data.lastReminderDate && new Date(data.lastReminderDate) < thirtyDaysAgo) {
        this.reminderData.delete(userId);
      }
    }
    
    this.saveReminderData();
  }

  /**
   * Destroy the service
   */
  destroy(): void {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
    }
  }
}

// Export singleton instance
export const dailyReminderService = DailyReminderService.getInstance();
