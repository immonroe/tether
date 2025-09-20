'use client';
/**
 * @fileoverview User preferences form for study group matching
 * 
 * This file is part of the Tether AI learning platform.
 * User preferences form component for study group matching.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { UserPreferences } from '@/lib/types';

interface UserPreferencesFormProps {
  initialPreferences?: Partial<UserPreferences>;
  onSubmit: (preferences: Omit<UserPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const SUBJECTS = [
  'Mathematics',
  'Science',
  'Programming',
  'Language Learning',
  'History',
  'Literature',
  'Art',
  'Music',
  'Business',
  'Psychology',
  'Philosophy',
  'Economics',
  'Medicine',
  'Engineering',
  'Other'
];

const LEARNING_GOALS = [
  'Pass an exam',
  'Learn a new skill',
  'Improve understanding',
  'Prepare for certification',
  'Career advancement',
  'Personal interest',
  'Academic research',
  'Professional development'
];

const PREFERRED_TIMES = [
  'Early morning (6-9 AM)',
  'Morning (9-12 PM)',
  'Afternoon (12-5 PM)',
  'Evening (5-8 PM)',
  'Night (8-11 PM)',
  'Late night (11 PM-6 AM)'
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

export const UserPreferencesForm: React.FC<UserPreferencesFormProps> = ({
  initialPreferences,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    subjects: initialPreferences?.subjects || [],
    skillLevel: initialPreferences?.skillLevel || 'beginner',
    learningGoals: initialPreferences?.learningGoals || [],
    availability: {
      timezone: initialPreferences?.availability?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      preferredTimes: initialPreferences?.availability?.preferredTimes || [],
      daysOfWeek: initialPreferences?.availability?.daysOfWeek || []
    },
    groupSize: {
      min: initialPreferences?.groupSize?.min || 2,
      max: initialPreferences?.groupSize?.max || 4
    },
    learningStyle: initialPreferences?.learningStyle || 'mixed',
    studyFrequency: initialPreferences?.studyFrequency || 'weekly'
  });

  const handleSubjectChange = (subject: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      subjects: checked 
        ? [...prev.subjects, subject]
        : prev.subjects.filter(s => s !== subject)
    }));
  };

  const handleGoalChange = (goal: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      learningGoals: checked 
        ? [...prev.learningGoals, goal]
        : prev.learningGoals.filter(g => g !== goal)
    }));
  };

  const handleTimeChange = (time: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        preferredTimes: checked 
          ? [...prev.availability.preferredTimes, time]
          : prev.availability.preferredTimes.filter(t => t !== time)
      }
    }));
  };

  const handleDayChange = (day: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        daysOfWeek: checked 
          ? [...prev.availability.daysOfWeek, day]
          : prev.availability.daysOfWeek.filter(d => d !== day)
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Study Preferences</h3>
        
        {/* Subjects */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subjects of Interest *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SUBJECTS.map(subject => (
              <Checkbox
                key={subject}
                label={subject}
                checked={formData.subjects.includes(subject)}
                onChange={(checked) => handleSubjectChange(subject, checked)}
              />
            ))}
          </div>
        </div>

        {/* Skill Level */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Skill Level *
          </label>
          <Select
            value={formData.skillLevel}
            onChange={(value) => setFormData(prev => ({ ...prev, skillLevel: value as any }))}
            options={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' }
            ]}
          />
        </div>

        {/* Learning Goals */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Learning Goals *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {LEARNING_GOALS.map(goal => (
              <Checkbox
                key={goal}
                label={goal}
                checked={formData.learningGoals.includes(goal)}
                onChange={(checked) => handleGoalChange(goal, checked)}
              />
            ))}
          </div>
        </div>

        {/* Learning Style */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Learning Style *
          </label>
          <Select
            value={formData.learningStyle}
            onChange={(value) => setFormData(prev => ({ ...prev, learningStyle: value as any }))}
            options={[
              { value: 'visual', label: 'Visual (diagrams, charts, images)' },
              { value: 'auditory', label: 'Auditory (listening, discussions)' },
              { value: 'kinesthetic', label: 'Kinesthetic (hands-on, practice)' },
              { value: 'reading', label: 'Reading/Writing (text, notes)' },
              { value: 'mixed', label: 'Mixed (combination of styles)' }
            ]}
          />
        </div>

        {/* Study Frequency */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Study Frequency *
          </label>
          <Select
            value={formData.studyFrequency}
            onChange={(value) => setFormData(prev => ({ ...prev, studyFrequency: value as any }))}
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'bi-weekly', label: 'Bi-weekly' },
              { value: 'monthly', label: 'Monthly' }
            ]}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Availability</h3>
        
        {/* Timezone */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <Input
            type="text"
            value={formData.availability.timezone}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              availability: { ...prev.availability, timezone: e.target.value }
            }))}
            placeholder="e.g., America/New_York"
          />
        </div>

        {/* Preferred Times */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Study Times
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {PREFERRED_TIMES.map(time => (
              <Checkbox
                key={time}
                label={time}
                checked={formData.availability.preferredTimes.includes(time)}
                onChange={(checked) => handleTimeChange(time, checked)}
              />
            ))}
          </div>
        </div>

        {/* Days of Week */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Days
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {DAYS_OF_WEEK.map(day => (
              <Checkbox
                key={day.value}
                label={day.label}
                checked={formData.availability.daysOfWeek.includes(day.value)}
                onChange={(checked) => handleDayChange(day.value, checked)}
              />
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Group Preferences</h3>
        
        {/* Group Size */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Group Size
            </label>
            <Input
              type="number"
              min="2"
              max="10"
              value={formData.groupSize.min}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                groupSize: { ...prev.groupSize, min: parseInt(e.target.value) || 2 }
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Group Size
            </label>
            <Input
              type="number"
              min="2"
              max="10"
              value={formData.groupSize.max}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                groupSize: { ...prev.groupSize, max: parseInt(e.target.value) || 4 }
              }))}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading || formData.subjects.length === 0 || formData.learningGoals.length === 0}>
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </form>
  );
};
