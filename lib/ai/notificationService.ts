/**
 * @fileoverview Notification service for flashcard scheduling and reminders
 * 
 * This file is part of the Tether AI learning platform.
 * Handles flashcard scheduling, notifications, and reminder management.
 */

import { Flashcard } from '../types';
import { sm2Service } from './sm2Service';

export interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  dueCardReminder: boolean;
  reminderTime: string; // HH:MM format
  reminderDays: number[]; // 0-6 (Sunday-Saturday)
  browserNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface StudyReminder {
  id: string;
  type: 'daily' | 'due_cards' | 'streak' | 'achievement';
  title: string;
  message: string;
  scheduledFor: Date;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface StudySchedule {
  id: string;
  userId: string;
  deckId: string;
  scheduledFor: Date;
  cardIds: string[];
  priority: 'high' | 'medium' | 'low';
  isCompleted: boolean;
  completedAt?: Date;
  estimatedDuration: number; // in minutes
}

export class NotificationService {
  private settings: NotificationSettings;
  private reminders: StudyReminder[] = [];
  private schedules: StudySchedule[] = [];
  private notificationPermission: NotificationPermission = 'default';

  constructor() {
    this.settings = this.getDefaultSettings();
    this.loadSettings();
    this.requestNotificationPermission();
  }

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    await this.requestNotificationPermission();
    this.scheduleDailyReminders();
    this.scheduleDueCardReminders();
    
    // Initialize daily reminder service
    if (typeof window !== 'undefined') {
      const { dailyReminderService } = await import('./dailyReminderService');
      await dailyReminderService.initialize?.();
    }
  }

  /**
   * Get default notification settings
   */
  private getDefaultSettings(): NotificationSettings {
    return {
      enabled: true,
      dailyReminder: true,
      dueCardReminder: true,
      reminderTime: '09:00',
      reminderDays: [1, 2, 3, 4, 5], // Monday to Friday
      browserNotifications: true,
      emailNotifications: false,
      pushNotifications: false
    };
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('flashcard-notification-settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }

  /**
   * Save settings to localStorage
   */
  saveSettings(settings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...settings };
    try {
      localStorage.setItem('flashcard-notification-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  /**
   * Get current settings
   */
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * Request browser notification permission
   */
  private async requestNotificationPermission(): Promise<void> {
    if (typeof window !== 'undefined' && 'Notification' in window && this.settings.browserNotifications) {
      try {
        this.notificationPermission = await Notification.requestPermission();
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  }

  /**
   * Create a study schedule for flashcards
   */
  createStudySchedule(flashcards: Flashcard[], deckId: string, userId: string): StudySchedule {
    const dueCards = sm2Service.getDueFlashcards(flashcards);
    const newCards = sm2Service.getNewFlashcards(flashcards);
    
    // Prioritize due cards, then add new cards
    const scheduledCards = [
      ...dueCards.slice(0, 10), // Max 10 due cards per session
      ...newCards.slice(0, 5)   // Max 5 new cards per session
    ];

    const schedule: StudySchedule = {
      id: `schedule_${Date.now()}`,
      userId,
      deckId,
      scheduledFor: this.getNextOptimalStudyTime(),
      cardIds: scheduledCards.map(card => card.id),
      priority: dueCards.length > 5 ? 'high' : dueCards.length > 0 ? 'medium' : 'low',
      isCompleted: false,
      estimatedDuration: Math.ceil(scheduledCards.length * 1.5) // 1.5 minutes per card
    };

    this.schedules.push(schedule);
    this.saveSchedules();
    return schedule;
  }

  /**
   * Get next optimal study time based on user preferences
   */
  private getNextOptimalStudyTime(): Date {
    const now = new Date();
    const [hours, minutes] = this.settings.reminderTime.split(':').map(Number);
    
    // Find next available day
    let nextDate = new Date(now);
    nextDate.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, move to tomorrow
    if (nextDate <= now) {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    
    // Find next day that matches user's preferred days
    while (!this.settings.reminderDays.includes(nextDate.getDay())) {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    
    return nextDate;
  }

  /**
   * Schedule daily reminders
   */
  private scheduleDailyReminders(): void {
    if (!this.settings.dailyReminder) return;

    const now = new Date();
    const [hours, minutes] = this.settings.reminderTime.split(':').map(Number);
    
    // Schedule for each preferred day
    this.settings.reminderDays.forEach(dayOfWeek => {
      const reminder = new Date(now);
      const daysUntilTarget = (dayOfWeek - now.getDay() + 7) % 7;
      reminder.setDate(reminder.getDate() + daysUntilTarget);
      reminder.setHours(hours, minutes, 0, 0);
      
      // If time has passed today, move to next week
      if (reminder <= now) {
        reminder.setDate(reminder.getDate() + 7);
      }
      
      this.scheduleReminder({
        id: `daily_${dayOfWeek}_${reminder.getTime()}`,
        type: 'daily',
        title: 'Daily Study Reminder',
        message: 'Time for your daily flashcard review!',
        scheduledFor: reminder,
        isRead: false,
        actionUrl: '/flashcards'
      });
    });
  }

  /**
   * Schedule due card reminders
   */
  private scheduleDueCardReminders(): void {
    if (!this.settings.dueCardReminder) return;

    // Check for due cards every hour
    setInterval(() => {
      this.checkDueCards();
    }, 60 * 60 * 1000); // Check every hour
  }

  /**
   * Check for due cards and create reminders
   */
  private checkDueCards(): void {
    // This would typically fetch from the database
    // For now, we'll create a placeholder reminder
    const dueCardsCount = this.getDueCardsCount();
    
    if (dueCardsCount > 0) {
      this.scheduleReminder({
        id: `due_cards_${Date.now()}`,
        type: 'due_cards',
        title: `${dueCardsCount} Cards Due for Review`,
        message: `You have ${dueCardsCount} flashcards ready for review.`,
        scheduledFor: new Date(),
        isRead: false,
        actionUrl: '/flashcards',
        metadata: { dueCardsCount }
      });
    }
  }

  /**
   * Get count of due cards (placeholder implementation)
   */
  private getDueCardsCount(): number {
    // This would typically query the database
    // For now, return a random number for demonstration
    return Math.floor(Math.random() * 10);
  }

  /**
   * Schedule a reminder
   */
  private scheduleReminder(reminder: StudyReminder): void {
    this.reminders.push(reminder);
    this.saveReminders();
    
    // Schedule browser notification if enabled
    if (this.settings.browserNotifications && this.notificationPermission === 'granted') {
      const delay = reminder.scheduledFor.getTime() - Date.now();
      if (delay > 0) {
        setTimeout(() => {
          this.showBrowserNotification(reminder);
        }, delay);
      }
    }
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(reminder: StudyReminder): void {
    if (this.notificationPermission === 'granted') {
      const notification = new Notification(reminder.title, {
        body: reminder.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: reminder.id,
        requireInteraction: true
      });

      notification.onclick = () => {
        window.focus();
        if (reminder.actionUrl) {
          window.location.href = reminder.actionUrl;
        }
        notification.close();
      };

      // Auto-close after 10 seconds
      setTimeout(() => notification.close(), 10000);
    }
  }

  /**
   * Get all reminders
   */
  getReminders(): StudyReminder[] {
    return [...this.reminders];
  }

  /**
   * Get unread reminders
   */
  getUnreadReminders(): StudyReminder[] {
    return this.reminders.filter(reminder => !reminder.isRead);
  }

  /**
   * Mark reminder as read
   */
  markReminderAsRead(reminderId: string): void {
    const reminder = this.reminders.find(r => r.id === reminderId);
    if (reminder) {
      reminder.isRead = true;
      this.saveReminders();
    }
  }

  /**
   * Mark all reminders as read
   */
  markAllRemindersAsRead(): void {
    this.reminders.forEach(reminder => {
      reminder.isRead = true;
    });
    this.saveReminders();
  }

  /**
   * Get study schedules
   */
  getSchedules(): StudySchedule[] {
    return [...this.schedules];
  }

  /**
   * Get upcoming schedules
   */
  getUpcomingSchedules(): StudySchedule[] {
    const now = new Date();
    return this.schedules
      .filter(schedule => schedule.scheduledFor > now && !schedule.isCompleted)
      .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
  }

  /**
   * Mark schedule as completed
   */
  markScheduleCompleted(scheduleId: string): void {
    const schedule = this.schedules.find(s => s.id === scheduleId);
    if (schedule) {
      schedule.isCompleted = true;
      schedule.completedAt = new Date();
      this.saveSchedules();
    }
  }

  /**
   * Get study streak reminder
   */
  createStreakReminder(currentStreak: number, longestStreak: number): StudyReminder {
    const isNewRecord = currentStreak > longestStreak;
    
    return {
      id: `streak_${Date.now()}`,
      type: 'streak',
      title: isNewRecord ? 'New Streak Record!' : 'Keep Your Streak Going!',
      message: isNewRecord 
        ? `Congratulations! You've set a new record with ${currentStreak} days!`
        : `You're on a ${currentStreak}-day study streak. Don't break it!`,
      scheduledFor: new Date(),
      isRead: false,
      actionUrl: '/flashcards',
      metadata: { currentStreak, longestStreak, isNewRecord }
    };
  }

  /**
   * Create achievement reminder
   */
  createAchievementReminder(achievement: string, description: string): StudyReminder {
    return {
      id: `achievement_${Date.now()}`,
      type: 'achievement',
      title: `Achievement Unlocked: ${achievement}`,
      message: description,
      scheduledFor: new Date(),
      isRead: false,
      actionUrl: '/progress',
      metadata: { achievement, description }
    };
  }

  /**
   * Save reminders to localStorage
   */
  private saveReminders(): void {
    try {
      localStorage.setItem('flashcard-reminders', JSON.stringify(this.reminders));
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  }

  /**
   * Load reminders from localStorage
   */
  private loadReminders(): void {
    try {
      const saved = localStorage.getItem('flashcard-reminders');
      if (saved) {
        this.reminders = JSON.parse(saved).map((r: any) => ({
          ...r,
          scheduledFor: new Date(r.scheduledFor)
        }));
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  }

  /**
   * Save schedules to localStorage
   */
  private saveSchedules(): void {
    try {
      localStorage.setItem('flashcard-schedules', JSON.stringify(this.schedules));
    } catch (error) {
      console.error('Error saving schedules:', error);
    }
  }

  /**
   * Load schedules from localStorage
   */
  private loadSchedules(): void {
    try {
      const saved = localStorage.getItem('flashcard-schedules');
      if (saved) {
        this.schedules = JSON.parse(saved).map((s: any) => ({
          ...s,
          scheduledFor: new Date(s.scheduledFor),
          completedAt: s.completedAt ? new Date(s.completedAt) : undefined
        }));
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications(): void {
    this.reminders = [];
    this.schedules = [];
    this.saveReminders();
    this.saveSchedules();
  }

  /**
   * Record a study session for streak tracking
   */
  async recordStudySession(userId: string): Promise<void> {
    if (typeof window !== 'undefined') {
      const { dailyReminderService } = await import('./dailyReminderService');
      dailyReminderService.recordStudySession(userId);
    }
  }

  /**
   * Get notification statistics
   */
  getNotificationStats(): {
    totalReminders: number;
    unreadReminders: number;
    upcomingSchedules: number;
    completedSchedules: number;
  } {
    return {
      totalReminders: this.reminders.length,
      unreadReminders: this.getUnreadReminders().length,
      upcomingSchedules: this.getUpcomingSchedules().length,
      completedSchedules: this.schedules.filter(s => s.isCompleted).length
    };
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
