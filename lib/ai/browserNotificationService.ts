/**
 * @fileoverview Browser notification service for handling native browser notifications
 * 
 * This file is part of the Tether AI learning platform.
 * Handles browser notification permissions, display, and interaction.
 */

export interface BrowserNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  actions?: NotificationAction[];
  data?: any;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationPermissionState {
  permission: NotificationPermission;
  isSupported: boolean;
  canRequest: boolean;
}

export class BrowserNotificationService {
  private static instance: BrowserNotificationService;
  private permission: NotificationPermission = 'default';
  private isSupported: boolean = false;

  constructor() {
    this.checkSupport();
    this.getPermission();
  }

  static getInstance(): BrowserNotificationService {
    if (!BrowserNotificationService.instance) {
      BrowserNotificationService.instance = new BrowserNotificationService();
    }
    return BrowserNotificationService.instance;
  }

  /**
   * Check if browser notifications are supported
   */
  private checkSupport(): void {
    this.isSupported = typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Get current notification permission
   */
  private getPermission(): void {
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
  }

  /**
   * Get notification permission state
   */
  getPermissionState(): NotificationPermissionState {
    return {
      permission: this.permission,
      isSupported: this.isSupported,
      canRequest: this.permission === 'default'
    };
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      throw new Error('Browser notifications are not supported');
    }

    if (this.permission === 'granted') {
      return this.permission;
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }

  /**
   * Show a browser notification
   */
  async showNotification(options: BrowserNotificationOptions): Promise<Notification> {
    if (!this.isSupported) {
      throw new Error('Browser notifications are not supported');
    }

    if (this.permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        timestamp: options.timestamp || Date.now(),
        actions: options.actions,
        data: options.data
      });

      // Auto-close after 10 seconds if not requiring interaction
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 10000);
      }

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      throw error;
    }
  }

  /**
   * Show a study reminder notification
   */
  async showStudyReminder(
    title: string,
    message: string,
    actionUrl?: string
  ): Promise<Notification> {
    const notification = await this.showNotification({
      title,
      body: message,
      icon: '/favicon.ico',
      tag: 'study-reminder',
      requireInteraction: true,
      actions: actionUrl ? [
        {
          action: 'study',
          title: 'Start Studying',
          icon: '/icons/study.svg'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ] : undefined,
      data: { actionUrl }
    });

    // Handle notification click
    notification.onclick = () => {
      if (typeof window !== 'undefined') {
        window.focus();
        if (actionUrl) {
          window.location.href = actionUrl;
        }
      }
      notification.close();
    };

    return notification;
  }

  /**
   * Show a due cards notification
   */
  async showDueCardsNotification(
    cardCount: number,
    actionUrl?: string
  ): Promise<Notification> {
    const title = `${cardCount} Cards Due for Review`;
    const message = cardCount === 1 
      ? 'You have 1 flashcard ready for review.'
      : `You have ${cardCount} flashcards ready for review.`;

    return this.showStudyReminder(title, message, actionUrl);
  }

  /**
   * Show a streak reminder notification
   */
  async showStreakReminder(
    currentStreak: number,
    isNewRecord: boolean,
    actionUrl?: string
  ): Promise<Notification> {
    const title = isNewRecord ? 'New Streak Record!' : 'Keep Your Streak Going!';
    const message = isNewRecord
      ? `Congratulations! You've set a new record with ${currentStreak} days!`
      : `You're on a ${currentStreak}-day study streak. Don't break it!`;

    return this.showStudyReminder(title, message, actionUrl);
  }

  /**
   * Show an achievement notification
   */
  async showAchievementNotification(
    achievement: string,
    description: string,
    actionUrl?: string
  ): Promise<Notification> {
    const title = `Achievement Unlocked: ${achievement}`;
    return this.showStudyReminder(title, description, actionUrl);
  }

  /**
   * Show a daily reminder notification
   */
  async showDailyReminder(actionUrl?: string): Promise<Notification> {
    const title = 'Daily Study Reminder';
    const message = 'Time for your daily flashcard review!';
    return this.showStudyReminder(title, message, actionUrl);
  }

  /**
   * Show a test notification
   */
  async showTestNotification(): Promise<Notification> {
    return this.showNotification({
      title: 'Test Notification',
      body: 'This is a test notification from Tether AI Learning Platform.',
      icon: '/favicon.ico',
      tag: 'test-notification',
      requireInteraction: false
    });
  }

  /**
   * Close all notifications with a specific tag
   */
  closeNotificationsByTag(tag: string): void {
    // Note: There's no direct way to close notifications by tag
    // This is a limitation of the Notification API
    console.log(`Cannot close notifications by tag: ${tag}`);
  }

  /**
   * Close all notifications
   */
  closeAllNotifications(): void {
    // Note: There's no direct way to close all notifications
    // This is a limitation of the Notification API
    console.log('Cannot close all notifications - this is a browser limitation');
  }

  /**
   * Check if notifications are enabled and supported
   */
  isEnabled(): boolean {
    return this.isSupported && this.permission === 'granted';
  }

  /**
   * Get notification statistics (placeholder)
   */
  getNotificationStats(): {
    totalShown: number;
    totalClicked: number;
    totalDismissed: number;
    averageClickRate: number;
  } {
    // This would typically be tracked in a database or localStorage
    // For now, return placeholder data
    return {
      totalShown: 0,
      totalClicked: 0,
      totalDismissed: 0,
      averageClickRate: 0
    };
  }

  /**
   * Set up notification event listeners
   */
  setupEventListeners(): void {
    // Listen for notification clicks
    self.addEventListener('notificationclick', (event) => {
      event.notification.close();
      
      if (event.action === 'study' && event.notification.data?.actionUrl && typeof window !== 'undefined') {
        window.location.href = event.notification.data.actionUrl;
      }
    });

    // Listen for notification close events
    self.addEventListener('notificationclose', (event) => {
      console.log('Notification closed:', event.notification.tag);
    });
  }

  /**
   * Initialize the notification service
   */
  async initialize(): Promise<void> {
    this.setupEventListeners();
    
    // Request permission if not already granted
    if (this.permission === 'default') {
      try {
        await this.requestPermission();
      } catch (error) {
        console.error('Failed to request notification permission:', error);
      }
    }
  }
}

// Export singleton instance
export const browserNotificationService = BrowserNotificationService.getInstance();
