import { ChatMessage, ChatSession, LearningStyle } from './types';
import { chatDatabaseService } from './databaseService';

export class ChatHistoryService {
  private storageKey = 'tether_chat_history';
  private sessionsKey = 'tether_chat_sessions';
  private useDatabase = true; // Flag to enable/disable database usage

  // Get all chat sessions for a user
  async getSessions(userId: string): Promise<ChatSession[]> {
    if (this.useDatabase) {
      try {
        return await chatDatabaseService.getSessions(userId);
      } catch (error) {
        console.error('Database error, falling back to localStorage:', error);
        return this.getSessionsFromLocalStorage(userId);
      }
    }
    return this.getSessionsFromLocalStorage(userId);
  }

  private getSessionsFromLocalStorage(userId: string): ChatSession[] {
    try {
      const sessions = localStorage.getItem(`${this.sessionsKey}_${userId}`);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Error loading chat sessions from localStorage:', error);
      return [];
    }
  }

  // Get messages for a specific session
  async getSessionMessages(sessionId: string, userId: string): Promise<ChatMessage[]> {
    if (this.useDatabase) {
      try {
        return await chatDatabaseService.getSessionMessages(sessionId, userId);
      } catch (error) {
        console.error('Database error, falling back to localStorage:', error);
        return this.getSessionMessagesFromLocalStorage(sessionId, userId);
      }
    }
    return this.getSessionMessagesFromLocalStorage(sessionId, userId);
  }

  private getSessionMessagesFromLocalStorage(sessionId: string, userId: string): ChatMessage[] {
    try {
      const sessions = this.getSessionsFromLocalStorage(userId);
      const session = sessions.find(s => s.id === sessionId);
      return session ? session.messages : [];
    } catch (error) {
      console.error('Error loading session messages from localStorage:', error);
      return [];
    }
  }

  // Create a new chat session
  async createSession(userId: string, learningStyle?: LearningStyle): Promise<ChatSession> {
    if (this.useDatabase) {
      try {
        return await chatDatabaseService.createSession(userId, learningStyle);
      } catch (error) {
        console.error('Database error, falling back to localStorage:', error);
        return this.createSessionInLocalStorage(userId, learningStyle);
      }
    }
    return this.createSessionInLocalStorage(userId, learningStyle);
  }

  private createSessionInLocalStorage(userId: string, learningStyle?: LearningStyle): ChatSession {
    const session: ChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      messages: [],
      learningStyle,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const sessions = this.getSessionsFromLocalStorage(userId);
    sessions.push(session);
    this.saveSessions(userId, sessions);

    return session;
  }

  // Add a message to a session
  async addMessage(sessionId: string, userId: string, message: ChatMessage, provider?: string, usage?: any): Promise<void> {
    if (this.useDatabase) {
      try {
        await chatDatabaseService.addMessage(sessionId, userId, message, provider, usage);
        return;
      } catch (error) {
        console.error('Database error, falling back to localStorage:', error);
        this.addMessageToLocalStorage(sessionId, userId, message);
      }
    } else {
      this.addMessageToLocalStorage(sessionId, userId, message);
    }
  }

  private addMessageToLocalStorage(sessionId: string, userId: string, message: ChatMessage): void {
    try {
      const sessions = this.getSessionsFromLocalStorage(userId);
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex === -1) {
        console.error('Session not found:', sessionId);
        return;
      }

      sessions[sessionIndex].messages.push(message);
      sessions[sessionIndex].updatedAt = new Date();
      
      this.saveSessions(userId, sessions);
    } catch (error) {
      console.error('Error adding message to localStorage:', error);
    }
  }

  // Update learning style for a session
  async updateLearningStyle(sessionId: string, userId: string, learningStyle: LearningStyle): Promise<void> {
    if (this.useDatabase) {
      try {
        await chatDatabaseService.updateLearningStyle(sessionId, userId, learningStyle);
        return;
      } catch (error) {
        console.error('Database error, falling back to localStorage:', error);
        this.updateLearningStyleInLocalStorage(sessionId, userId, learningStyle);
      }
    } else {
      this.updateLearningStyleInLocalStorage(sessionId, userId, learningStyle);
    }
  }

  private updateLearningStyleInLocalStorage(sessionId: string, userId: string, learningStyle: LearningStyle): void {
    try {
      const sessions = this.getSessionsFromLocalStorage(userId);
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex === -1) {
        console.error('Session not found:', sessionId);
        return;
      }

      sessions[sessionIndex].learningStyle = learningStyle;
      sessions[sessionIndex].updatedAt = new Date();
      
      this.saveSessions(userId, sessions);
    } catch (error) {
      console.error('Error updating learning style in localStorage:', error);
    }
  }

  // Delete a session
  async deleteSession(sessionId: string, userId: string): Promise<void> {
    if (this.useDatabase) {
      try {
        await chatDatabaseService.deleteSession(sessionId, userId);
        return;
      } catch (error) {
        console.error('Database error, falling back to localStorage:', error);
        this.deleteSessionFromLocalStorage(sessionId, userId);
      }
    } else {
      this.deleteSessionFromLocalStorage(sessionId, userId);
    }
  }

  private deleteSessionFromLocalStorage(sessionId: string, userId: string): void {
    try {
      const sessions = this.getSessionsFromLocalStorage(userId);
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      this.saveSessions(userId, filteredSessions);
    } catch (error) {
      console.error('Error deleting session from localStorage:', error);
    }
  }

  // Get the most recent session
  async getCurrentSession(userId: string): Promise<ChatSession | null> {
    if (this.useDatabase) {
      try {
        return await chatDatabaseService.getCurrentSession(userId);
      } catch (error) {
        console.error('Database error, falling back to localStorage:', error);
        return this.getCurrentSessionFromLocalStorage(userId);
      }
    }
    return this.getCurrentSessionFromLocalStorage(userId);
  }

  private getCurrentSessionFromLocalStorage(userId: string): ChatSession | null {
    const sessions = this.getSessionsFromLocalStorage(userId);
    if (sessions.length === 0) return null;
    
    return sessions.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];
  }

  // Clear all sessions for a user
  async clearAllSessions(userId: string): Promise<void> {
    if (this.useDatabase) {
      try {
        // Get all sessions and delete them one by one
        const sessions = await this.getSessions(userId);
        for (const session of sessions) {
          await chatDatabaseService.deleteSession(session.id, userId);
        }
        return;
      } catch (error) {
        console.error('Database error, falling back to localStorage:', error);
        this.clearAllSessionsFromLocalStorage(userId);
      }
    } else {
      this.clearAllSessionsFromLocalStorage(userId);
    }
  }

  private clearAllSessionsFromLocalStorage(userId: string): void {
    try {
      localStorage.removeItem(`${this.sessionsKey}_${userId}`);
    } catch (error) {
      console.error('Error clearing sessions from localStorage:', error);
    }
  }

  // Export sessions for backup
  async exportSessions(userId: string): Promise<string> {
    if (this.useDatabase) {
      try {
        return await chatDatabaseService.exportSessions(userId);
      } catch (error) {
        console.error('Database error, falling back to localStorage:', error);
        return this.exportSessionsFromLocalStorage(userId);
      }
    }
    return this.exportSessionsFromLocalStorage(userId);
  }

  private exportSessionsFromLocalStorage(userId: string): string {
    const sessions = this.getSessionsFromLocalStorage(userId);
    return JSON.stringify(sessions, null, 2);
  }

  // Import sessions from backup
  async importSessions(userId: string, sessionsData: string): Promise<boolean> {
    if (this.useDatabase) {
      try {
        return await chatDatabaseService.importSessions(userId, sessionsData);
      } catch (error) {
        console.error('Database error, falling back to localStorage:', error);
        return this.importSessionsToLocalStorage(userId, sessionsData);
      }
    }
    return this.importSessionsToLocalStorage(userId, sessionsData);
  }

  private importSessionsToLocalStorage(userId: string, sessionsData: string): boolean {
    try {
      const sessions = JSON.parse(sessionsData);
      this.saveSessions(userId, sessions);
      return true;
    } catch (error) {
      console.error('Error importing sessions to localStorage:', error);
      return false;
    }
  }

  private saveSessions(userId: string, sessions: ChatSession[]): void {
    try {
      localStorage.setItem(`${this.sessionsKey}_${userId}`, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  }

  // Get session statistics
  async getSessionStats(userId: string): Promise<{
    totalSessions: number;
    totalMessages: number;
    averageMessagesPerSession: number;
    mostUsedLearningStyle: LearningStyle | null;
  }> {
    if (this.useDatabase) {
      try {
        return await chatDatabaseService.getSessionStats(userId);
      } catch (error) {
        console.error('Database error, falling back to localStorage:', error);
        return this.getSessionStatsFromLocalStorage(userId);
      }
    }
    return this.getSessionStatsFromLocalStorage(userId);
  }

  private getSessionStatsFromLocalStorage(userId: string): {
    totalSessions: number;
    totalMessages: number;
    averageMessagesPerSession: number;
    mostUsedLearningStyle: LearningStyle | null;
  } {
    const sessions = this.getSessionsFromLocalStorage(userId);
    const totalSessions = sessions.length;
    const totalMessages = sessions.reduce((sum, session) => sum + session.messages.length, 0);
    const averageMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0;

    // Count learning styles
    const styleCounts: Record<string, number> = {};
    sessions.forEach(session => {
      if (session.learningStyle) {
        styleCounts[session.learningStyle] = (styleCounts[session.learningStyle] || 0) + 1;
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
  }

  // Enable or disable database usage
  setDatabaseUsage(enabled: boolean): void {
    this.useDatabase = enabled;
  }

  // Check if database is available
  isDatabaseEnabled(): boolean {
    return this.useDatabase;
  }
}

// Create singleton instance
export const chatHistoryService = new ChatHistoryService();
