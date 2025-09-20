/**
 * @fileoverview User preferences service for study group matching
 * 
 * This file is part of the Tether AI learning platform.
 * Service for managing user preferences in the database.
 */

import { supabase } from '@/lib/supabase';
import { UserPreferences } from '@/lib/types';

export class UserPreferencesService {
  /**
   * Get user preferences by user ID
   */
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user preferences:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        subjects: data.subjects || [],
        skillLevel: data.skill_level,
        learningGoals: data.learning_goals || [],
        availability: data.availability,
        groupSize: data.group_size,
        learningStyle: data.learning_style,
        studyFrequency: data.study_frequency,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      return null;
    }
  }

  /**
   * Create or update user preferences
   */
  async saveUserPreferences(
    userId: string,
    preferences: Omit<UserPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          subjects: preferences.subjects,
          skill_level: preferences.skillLevel,
          learning_goals: preferences.learningGoals,
          availability: preferences.availability,
          group_size: preferences.groupSize,
          learning_style: preferences.learningStyle,
          study_frequency: preferences.studyFrequency,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving user preferences:', error);
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        subjects: data.subjects || [],
        skillLevel: data.skill_level,
        learningGoals: data.learning_goals || [],
        availability: data.availability,
        groupSize: data.group_size,
        learningStyle: data.learning_style,
        studyFrequency: data.study_frequency,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Error in saveUserPreferences:', error);
      return null;
    }
  }

  /**
   * Get all users with their preferences for matching
   */
  async getAllUsersWithPreferences(): Promise<Array<UserPreferences & { name: string }>> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select(`
          *,
          users!inner(name)
        `);

      if (error) {
        console.error('Error fetching users with preferences:', error);
        return [];
      }

      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        name: item.users.name,
        subjects: item.subjects || [],
        skillLevel: item.skill_level,
        learningGoals: item.learning_goals || [],
        availability: item.availability,
        groupSize: item.group_size,
        learningStyle: item.learning_style,
        studyFrequency: item.study_frequency,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));
    } catch (error) {
      console.error('Error in getAllUsersWithPreferences:', error);
      return [];
    }
  }

  /**
   * Get users by subject for targeted matching
   */
  async getUsersBySubject(subject: string): Promise<Array<UserPreferences & { name: string }>> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select(`
          *,
          users!inner(name)
        `)
        .contains('subjects', [subject]);

      if (error) {
        console.error('Error fetching users by subject:', error);
        return [];
      }

      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        name: item.users.name,
        subjects: item.subjects || [],
        skillLevel: item.skill_level,
        learningGoals: item.learning_goals || [],
        availability: item.availability,
        groupSize: item.group_size,
        learningStyle: item.learning_style,
        studyFrequency: item.study_frequency,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));
    } catch (error) {
      console.error('Error in getUsersBySubject:', error);
      return [];
    }
  }

  /**
   * Delete user preferences
   */
  async deleteUserPreferences(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting user preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteUserPreferences:', error);
      return false;
    }
  }

  /**
   * Check if user has preferences set
   */
  async hasUserPreferences(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (error) {
        return false;
      }

      return !!data;
    } catch (error) {
      return false;
    }
  }
}

export const userPreferencesService = new UserPreferencesService();
