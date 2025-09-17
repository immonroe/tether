import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, LearningStyle } from '@/lib/ai/types';
import { chatHistoryService } from '@/lib/ai/chatHistory';

interface UseChatOptions {
  userId: string;
  sessionId?: string;
  initialLearningStyle?: LearningStyle;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  learningStyle: LearningStyle | null;
  sessionId: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  updateLearningStyle: (style: LearningStyle) => void;
  loadSession: (sessionId: string) => void;
  createNewSession: () => void;
}

export const useChat = ({ 
  userId, 
  sessionId: initialSessionId, 
  initialLearningStyle 
}: UseChatOptions): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [learningStyle, setLearningStyle] = useState<LearningStyle | null>(initialLearningStyle || null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(initialSessionId || null);

  // Load session on mount
  useEffect(() => {
    const initializeSession = async () => {
      if (initialSessionId) {
        await loadSession(initialSessionId);
      } else {
        // Create new session if none provided
        await createNewSession();
      }
    };
    
    initializeSession();
  }, [initialSessionId]);

  const loadSession = useCallback(async (sessionId: string) => {
    try {
      const sessionMessages = await chatHistoryService.getSessionMessages(sessionId, userId);
      setMessages(sessionMessages);
      setCurrentSessionId(sessionId);
      setError(null);
    } catch (err) {
      setError('Failed to load session');
      console.error('Error loading session:', err);
    }
  }, [userId]);

  const createNewSession = useCallback(async () => {
    try {
      const newSession = await chatHistoryService.createSession(userId, learningStyle || undefined);
      setCurrentSessionId(newSession.id);
      setMessages([]);
      setError(null);
    } catch (err) {
      setError('Failed to create new session');
      console.error('Error creating session:', err);
    }
  }, [userId, learningStyle]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !currentSessionId) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    await chatHistoryService.addMessage(currentSessionId, userId, userMessage);

    setIsLoading(true);
    setError(null);

    try {
      // Prepare messages for API (convert to expected format)
      const apiMessages = [...messages, userMessage].map(msg => ({
        sender: msg.role === 'assistant' ? 'ai' : 'user',
        message: msg.content,
        timestamp: msg.timestamp
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          learningStyle,
          sessionId: currentSessionId
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.data.message,
        timestamp: data.data.timestamp
      };

      // Add AI response
      setMessages(prev => [...prev, aiMessage]);
      await chatHistoryService.addMessage(
        currentSessionId, 
        userId, 
        aiMessage, 
        data.data.provider, 
        data.data.usage
      );

      // Update learning style if detected
      if (data.data.learningStyle && data.data.learningStyle !== learningStyle) {
        setLearningStyle(data.data.learningStyle);
        await chatHistoryService.updateLearningStyle(currentSessionId, userId, data.data.learningStyle);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentSessionId, userId, learningStyle]);

  const clearMessages = useCallback(async () => {
    setMessages([]);
    if (currentSessionId) {
      await chatHistoryService.deleteSession(currentSessionId, userId);
      await createNewSession();
    }
  }, [currentSessionId, userId, createNewSession]);

  const updateLearningStyle = useCallback(async (style: LearningStyle) => {
    setLearningStyle(style);
    if (currentSessionId) {
      await chatHistoryService.updateLearningStyle(currentSessionId, userId, style);
    }
  }, [currentSessionId, userId]);

  return {
    messages,
    isLoading,
    error,
    learningStyle,
    sessionId: currentSessionId,
    sendMessage,
    clearMessages,
    updateLearningStyle,
    loadSession,
    createNewSession
  };
};
