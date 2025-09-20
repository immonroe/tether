/**
 * @fileoverview Database operations for AI chat history and user data
 * 
 * This file is part of the Tether AI learning platform.
 * database operations for ai chat history and user data for the application.
 */

import { supabase } from '@/lib/supabase';
import { ChatMessage, ChatSession, LearningStyle } from './types';

export class ChatDatabaseService {
  private supabaseClient = supabase;

  // Get all chat sessions for a user
  async getSessions(userId: string): Promise<ChatSession[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from('chat_sessions')
        .select(`
          id,
          user_id,
          learning_style,
          created_at,
          updated_at,
          chat_messages (
            id,
            role,
            content,
            timestamp,
            provider,
            usage
          )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data?.map(session => ({
        id: session.id,
        userId: session.user_id,
        learningStyle: session.learning_style as LearningStyle,
        messages: session.chat_messages?.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
          timestamp: msg.timestamp
        })) || [],
        createdAt: new Date(session.created_at),
        updatedAt: new Date(session.updated_at)
      })) || [];
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      return [];
    }
  }

  // Get messages for a specific session
  async getSessionMessages(sessionId: string, userId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      // Verify user owns this session
      const { data: session, error: sessionError } = await this.supabaseClient
        .from('chat_sessions')
        .select('user_id')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session || session.user_id !== userId) {
        throw new Error('Session not found or access denied');
      }

      return data?.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: msg.timestamp
      })) || [];
    } catch (error) {
      console.error('Error fetching session messages:', error);
      return [];
    }
  }

  // Create a new chat session
  async createSession(userId: string, learningStyle?: LearningStyle): Promise<ChatSession> {
    try {
      const { data, error } = await this.supabaseClient
        .from('chat_sessions')
        .insert({
          user_id: userId,
          learning_style: learningStyle
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        learningStyle: data.learning_style as LearningStyle,
        messages: [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  }

  // Add a message to a session
  async addMessage(
    sessionId: string, 
    userId: string, 
    message: ChatMessage,
    provider?: string,
    usage?: any
  ): Promise<void> {
    try {
      // Verify user owns this session
      const { data: session, error: sessionError } = await this.supabaseClient
        .from('chat_sessions')
        .select('user_id')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session || session.user_id !== userId) {
        throw new Error('Session not found or access denied');
      }

      const { error } = await this.supabaseClient
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp,
          provider,
          usage
        });

      if (error) throw error;

      // Update session's updated_at timestamp
      await this.supabaseClient
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);

    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  // Update learning style for a session
  async updateLearningStyle(sessionId: string, userId: string, learningStyle: LearningStyle): Promise<void> {
    try {
      const { error } = await this.supabaseClient
        .from('chat_sessions')
        .update({ 
          learning_style: learningStyle,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating learning style:', error);
      throw error;
    }
  }

  // Delete a session
  async deleteSession(sessionId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabaseClient
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  // Get the most recent session
  async getCurrentSession(userId: string): Promise<ChatSession | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from('chat_sessions')
        .select(`
          id,
          user_id,
          learning_style,
          created_at,
          updated_at,
          chat_messages (
            id,
            role,
            content,
            timestamp,
            provider,
            usage
          )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        learningStyle: data.learning_style as LearningStyle,
        messages: data.chat_messages?.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
          timestamp: msg.timestamp
        })) || [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error fetching current session:', error);
      return null;
    }
  }

  // Get session statistics
  async getSessionStats(userId: string): Promise<{
    totalSessions: number;
    totalMessages: number;
    averageMessagesPerSession: number;
    mostUsedLearningStyle: LearningStyle | null;
  }> {
    try {
      const { data: sessions, error: sessionsError } = await this.supabaseClient
        .from('chat_sessions')
        .select('id, learning_style')
        .eq('user_id', userId);

      if (sessionsError) throw sessionsError;

      const { data: messages, error: messagesError } = await this.supabaseClient
        .from('chat_messages')
        .select('session_id')
        .in('session_id', sessions?.map(s => s.id) || []);

      if (messagesError) throw messagesError;

      const totalSessions = sessions?.length || 0;
      const totalMessages = messages?.length || 0;
      const averageMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0;

      // Count learning styles
      const styleCounts: Record<string, number> = {};
      sessions?.forEach(session => {
        if (session.learning_style) {
          styleCounts[session.learning_style] = (styleCounts[session.learning_style] || 0) + 1;
        }
      });

      const mostUsedLearningStyle = Object.keys(styleCounts).length > 0
        ? Object.entries(styleCounts).reduce((a, b) => styleCounts[a[0]] > styleCounts[b[0]] ? a : b)[0] as LearningStyle
        : null;

      return {
        totalSessions,
        totalMessages,
        averageMessagesPerSession,
        mostUsedLearningStyle
      };
    } catch (error) {
      console.error('Error fetching session stats:', error);
      return {
        totalSessions: 0,
        totalMessages: 0,
        averageMessagesPerSession: 0,
        mostUsedLearningStyle: null
      };
    }
  }

  // Export sessions for backup
  async exportSessions(userId: string): Promise<string> {
    try {
      const sessions = await this.getSessions(userId);
      return JSON.stringify(sessions, null, 2);
    } catch (error) {
      console.error('Error exporting sessions:', error);
      return '[]';
    }
  }

  // Import sessions from backup
  async importSessions(userId: string, sessionsData: string): Promise<boolean> {
    try {
      const sessions = JSON.parse(sessionsData);
      
      for (const session of sessions) {
        const { data: newSession, error: sessionError } = await this.supabaseClient
          .from('chat_sessions')
          .insert({
            user_id: userId,
            learning_style: session.learningStyle
          })
          .select()
          .single();

        if (sessionError) throw sessionError;

        // Import messages
        for (const message of session.messages || []) {
          await this.supabaseClient
            .from('chat_messages')
            .insert({
              session_id: newSession.id,
              role: message.role,
              content: message.content,
              timestamp: message.timestamp
            });
        }
      }

      return true;
    } catch (error) {
      console.error('Error importing sessions:', error);
      return false;
    }
  }
}

// Create singleton instance
export const chatDatabaseService = new ChatDatabaseService();
