'use client';
/**
 * @fileoverview Notification bell component for displaying study reminders
 * 
 * This file is part of the Tether AI learning platform.
 * Notification bell component with badge for unread notifications.
 */

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Clock, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { notificationService, StudyReminder } from '@/lib/ai/notificationService';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reminders, setReminders] = useState<StudyReminder[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadReminders();
    
    // Refresh reminders every minute
    const interval = setInterval(loadReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadReminders = () => {
    const allReminders = notificationService.getReminders();
    const unreadReminders = notificationService.getUnreadReminders();
    
    setReminders(allReminders);
    setUnreadCount(unreadReminders.length);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      loadReminders();
    }
  };

  const handleMarkAsRead = (reminderId: string) => {
    notificationService.markReminderAsRead(reminderId);
    loadReminders();
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllRemindersAsRead();
    loadReminders();
  };

  const handleReminderClick = (reminder: StudyReminder) => {
    handleMarkAsRead(reminder.id);
    if (reminder.actionUrl) {
      window.location.href = reminder.actionUrl;
    }
  };

  const getReminderIcon = (type: StudyReminder['type']) => {
    switch (type) {
      case 'daily':
        return <Clock className="w-4 h-4" />;
      case 'due_cards':
        return <Target className="w-4 h-4" />;
      case 'streak':
        return <TrendingUp className="w-4 h-4" />;
      case 'achievement':
        return <Check className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getReminderColor = (type: StudyReminder['type']) => {
    switch (type) {
      case 'daily':
        return 'text-blue-600 bg-blue-100';
      case 'due_cards':
        return 'text-orange-600 bg-orange-100';
      case 'streak':
        return 'text-green-600 bg-green-100';
      case 'achievement':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="small"
        onClick={handleToggle}
        className="relative p-2 hover:bg-gray-100 rounded-full"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="danger" 
            className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => setIsOpen(false)}
                  className="p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {reminders.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
                <p className="text-sm">Study some flashcards to get reminders!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {reminders
                  .sort((a, b) => new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime())
                  .map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !reminder.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => handleReminderClick(reminder)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${getReminderColor(reminder.type)}`}>
                          {getReminderIcon(reminder.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {reminder.title}
                            </h4>
                            {!reminder.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {reminder.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {new Date(reminder.scheduledFor).toLocaleDateString()}
                            </span>
                            {!reminder.isRead && (
                              <Button
                                variant="ghost"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(reminder.id);
                                }}
                                className="text-xs text-gray-400 hover:text-gray-600"
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {reminders.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{reminders.length} total notifications</span>
                <span>{unreadCount} unread</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
