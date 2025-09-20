/**
 * @fileoverview Custom hook for notification management
 * 
 * This file is part of the Tether AI learning platform.
 * React hook for managing notifications, reminders, and study tracking.
 */

import { useState, useEffect, useCallback } from 'react';
import { notificationService, StudyReminder } from '@/lib/ai/notificationService';
import { schedulingService, StudySessionPlan, StudyRecommendation } from '@/lib/ai/schedulingService';
import { dailyReminderService, DailyReminderData } from '@/lib/ai/dailyReminderService';
import { browserNotificationService } from '@/lib/ai/browserNotificationService';

export interface UseNotificationsReturn {
  // Notification state
  reminders: StudyReminder[];
  unreadCount: number;
  isNotificationSupported: boolean;
  notificationPermission: 'default' | 'granted' | 'denied';
  
  // Study schedule state
  upcomingSessions: StudySessionPlan[];
  recommendations: StudyRecommendation[];
  
  // Daily reminder state
  reminderData: DailyReminderData | null;
  streakCount: number;
  longestStreak: number;
  
  // Actions
  markReminderAsRead: (reminderId: string) => void;
  markAllRemindersAsRead: () => void;
  requestNotificationPermission: () => Promise<boolean>;
  recordStudySession: () => void;
  updateReminderSettings: (settings: Partial<DailyReminderData>) => void;
  refreshData: () => void;
}

export const useNotifications = (userId: string): UseNotificationsReturn => {
  const [reminders, setReminders] = useState<StudyReminder[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationSupported, setIsNotificationSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [upcomingSessions, setUpcomingSessions] = useState<StudySessionPlan[]>([]);
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [reminderData, setReminderData] = useState<DailyReminderData | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
    initializeNotifications();
  }, [userId]);

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(loadData, 60000); // Every minute
    return () => clearInterval(interval);
  }, [userId]);

  const loadData = useCallback(() => {
    // Load reminders
    const allReminders = notificationService.getReminders();
    const unreadReminders = notificationService.getUnreadReminders();
    setReminders(allReminders);
    setUnreadCount(unreadReminders.length);

    // Load study schedule
    const sessions = schedulingService.getUpcomingSessions(userId);
    const studyRecommendations = schedulingService.getStudyRecommendations(userId);
    setUpcomingSessions(sessions);
    setRecommendations(studyRecommendations);

    // Load reminder data
    const userReminderData = dailyReminderService.getReminderData(userId);
    setReminderData(userReminderData);
  }, [userId]);

  const initializeNotifications = useCallback(async () => {
    try {
      await notificationService.initialize();
      await browserNotificationService.initialize();
      
      const permissionState = browserNotificationService.getPermissionState();
      setIsNotificationSupported(permissionState.isSupported);
      setNotificationPermission(permissionState.permission);
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }, []);

  const markReminderAsRead = useCallback((reminderId: string) => {
    notificationService.markReminderAsRead(reminderId);
    loadData();
  }, [loadData]);

  const markAllRemindersAsRead = useCallback(() => {
    notificationService.markAllRemindersAsRead();
    loadData();
  }, [loadData]);

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    try {
      const permission = await browserNotificationService.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  const recordStudySession = useCallback(() => {
    if (userId) {
      notificationService.recordStudySession(userId);
      loadData();
    }
  }, [userId, loadData]);

  const updateReminderSettings = useCallback((settings: Partial<DailyReminderData>) => {
    if (userId) {
      dailyReminderService.updateReminderSettings(userId, settings);
      loadData();
    }
  }, [userId, loadData]);

  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    // Notification state
    reminders,
    unreadCount,
    isNotificationSupported,
    notificationPermission,
    
    // Study schedule state
    upcomingSessions,
    recommendations,
    
    // Daily reminder state
    reminderData,
    streakCount: reminderData?.streakCount || 0,
    longestStreak: reminderData?.longestStreak || 0,
    
    // Actions
    markReminderAsRead,
    markAllRemindersAsRead,
    requestNotificationPermission,
    recordStudySession,
    updateReminderSettings,
    refreshData
  };
};
