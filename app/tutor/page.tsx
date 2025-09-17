'use client';

import React, { useState } from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ChatMessage } from '@/lib/types';

// Mock data
const mockChatHistory: ChatMessage[] = [
  { id: 1, message: "Can you explain the concept of derivatives in calculus?", sender: "user", timestamp: "2 minutes ago" },
  { id: 2, message: "A derivative represents the rate of change of a function at any given point. Think of it as the slope of a tangent line to the curve. For example, if you're driving and your speedometer shows 60 mph, that's the derivative of your position with respect to time at that moment.", sender: "ai", timestamp: "2 minutes ago" },
];

export default function TutorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatHistory);

  const handleSendMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: messages.length + 1,
      message,
      sender: 'user',
      timestamp: 'Just now'
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: messages.length + 2,
        message: "I understand you're asking about that topic. Let me provide a detailed explanation...",
        sender: 'ai',
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <ChatInterface 
      messages={messages}
      onSendMessage={handleSendMessage}
    />
  );
}
