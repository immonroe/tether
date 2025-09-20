'use client';
/**
 * @fileoverview Notification settings component for managing study reminders
 * 
 * This file is part of the Tether AI learning platform.
 * Settings component for configuring notification preferences and study reminders.
 */

import React, { useState, useEffect } from 'react';
import { Bell, Clock, Calendar, Mail, Smartphone, Save, RotateCcw, X, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { notificationService, NotificationSettings as NotificationSettingsType } from '@/lib/ai/notificationService';

interface NotificationSettingsProps {
  onClose?: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<NotificationSettingsType>(notificationService.getSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setSettings(notificationService.getSettings());
  }, []);

  const handleSettingChange = (key: keyof NotificationSettingsType, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      notificationService.saveSettings(settings);
      setHasChanges(false);
      // Show success message or toast
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const defaultSettings = notificationService.getSettings();
    setSettings(defaultSettings);
    setHasChanges(false);
  };

  const handleTestNotification = async () => {
    if (settings.browserNotifications && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('Test Notification', {
            body: 'This is a test notification from Tether AI Learning Platform.',
            icon: '/favicon.ico'
          });
        }
      } catch (error) {
        console.error('Error showing test notification:', error);
      }
    }
  };

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return { value: `${hour}:00`, label: `${hour}:00` };
  });

  const dayOptions = [
    { value: '0', label: 'Sunday' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' }
  ];

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
              <p className="text-sm text-gray-600">Manage your study reminders and notifications</p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* General Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Enable Notifications</p>
                <p className="text-sm text-gray-600">Turn on all study notifications</p>
              </div>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
            />
          </div>
        </div>

        {/* Study Reminders */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Study Reminders</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Daily Study Reminder</p>
                  <p className="text-sm text-gray-600">Get reminded to study every day</p>
                </div>
              </div>
              <Switch
                checked={settings.dailyReminder}
                onCheckedChange={(checked) => handleSettingChange('dailyReminder', checked)}
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Due Cards Reminder</p>
                  <p className="text-sm text-gray-600">Get notified when cards are due for review</p>
                </div>
              </div>
              <Switch
                checked={settings.dueCardReminder}
                onCheckedChange={(checked) => handleSettingChange('dueCardReminder', checked)}
                disabled={!settings.enabled}
              />
            </div>
          </div>
        </div>

        {/* Reminder Schedule */}
        {settings.dailyReminder && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Reminder Schedule</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Reminder Time</label>
                <Select
                  value={settings.reminderTime}
                  onChange={(e) => handleSettingChange('reminderTime', e.target.value)}
                  disabled={!settings.enabled}
                >
                  {timeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Reminder Days</label>
                <div className="space-y-2">
                  {dayOptions.map(day => (
                    <label key={day.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.reminderDays.includes(parseInt(day.value))}
                        onChange={(e) => {
                          const dayValue = parseInt(day.value);
                          const newDays = e.target.checked
                            ? [...settings.reminderDays, dayValue]
                            : settings.reminderDays.filter(d => d !== dayValue);
                          handleSettingChange('reminderDays', newDays);
                        }}
                        disabled={!settings.enabled}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Channels */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Notification Channels</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Browser Notifications</p>
                  <p className="text-sm text-gray-600">Show notifications in your browser</p>
                </div>
              </div>
              <Switch
                checked={settings.browserNotifications}
                onCheckedChange={(checked) => handleSettingChange('browserNotifications', checked)}
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Send reminders via email (coming soon)</p>
                </div>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                disabled={!settings.enabled || true} // Disabled for now
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-600">Mobile push notifications (coming soon)</p>
                </div>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                disabled={!settings.enabled || true} // Disabled for now
              />
            </div>
          </div>
        </div>

        {/* Test Notification */}
        {settings.browserNotifications && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">Test Notification</p>
                <p className="text-sm text-blue-700">Send a test notification to verify settings</p>
              </div>
              <Button
                variant="secondary"
                size="small"
                onClick={handleTestNotification}
              >
                Send Test
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          
          <div className="flex items-center space-x-3">
            {onClose && (
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
