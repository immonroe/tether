'use client';

import React from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useChat } from '@/hooks/useChat';

export default function TutorPage() {
  // For now, using a mock user ID. In a real app, this would come from auth context
  const userId = 'mock-user-123';
  
  const {
    messages,
    isLoading,
    error,
    learningStyle,
    sendMessage,
    updateLearningStyle
  } = useChat({ 
    userId,
    initialLearningStyle: 'mixed'
  });

  // Convert messages to the format expected by ChatInterface
  const chatMessages = messages.map(msg => ({
    id: `${msg.role}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    message: msg.content,
    sender: (msg.role === 'assistant' ? 'ai' : 'user') as 'user' | 'ai',
    timestamp: msg.timestamp || new Date().toISOString()
  }));

  return (
    <ChatInterface 
      messages={chatMessages}
      onSendMessage={sendMessage}
      isLoading={isLoading}
      error={error}
      learningStyle={learningStyle}
      onLearningStyleChange={updateLearningStyle}
      userId={userId}
      showLearningInsights={true}
    />
  );
}
