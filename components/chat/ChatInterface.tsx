'use client';
/**
 * @fileoverview Main chat interface with AI tutor integration
 * 
 * This file is part of the Tether AI learning platform.
 * main chat interface with ai tutor integration for the application.
 */


import React, { useState, useRef } from 'react';
import { Upload, Mic, PenTool, Send, AlertCircle, Loader2, Image, Lightbulb, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChatMessage } from '@/lib/types';
import { LearningStyle } from '@/lib/ai/types';
import { LearningStyleInsights } from './LearningStyleInsights';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  error?: string | null;
  learningStyle?: LearningStyle | null;
  onLearningStyleChange?: (style: LearningStyle) => void;
  userId?: string;
  showLearningInsights?: boolean;
}

interface EnhancedChatMessage extends ChatMessage {
  images?: string[];
  suggestions?: string[];
  provider?: string;
  model?: string;
  fallback?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage,
  isLoading = false,
  error = null,
  learningStyle = null,
  onLearningStyleChange,
  userId,
  showLearningInsights = true
}) => {
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (chatInput.trim() && !isLoading) {
      onSendMessage(chatInput.trim());
      setChatInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const learningStyleOptions: { value: LearningStyle; label: string; emoji: string }[] = [
    { value: 'visual', label: 'Visual', emoji: '👁️' },
    { value: 'auditory', label: 'Auditory', emoji: '👂' },
    { value: 'kinesthetic', label: 'Hands-on', emoji: '✋' },
    { value: 'reading', label: 'Reading', emoji: '📖' },
    { value: 'mixed', label: 'Mixed', emoji: '🔄' }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">AI Tutor</h2>
          <p className="text-sm text-gray-500">
            Ask me anything about your studies
            {learningStyle && (
              <span className="ml-2 text-blue-600">
                • {learningStyleOptions.find(opt => opt.value === learningStyle)?.emoji} {learningStyleOptions.find(opt => opt.value === learningStyle)?.label}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {onLearningStyleChange && (
            <select
              value={learningStyle || 'mixed'}
              onChange={(e) => onLearningStyleChange(e.target.value as LearningStyle)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              {learningStyleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.emoji} {option.label}
                </option>
              ))}
            </select>
          )}
          <Button variant="outline" size="small" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
          <Button variant="outline" size="small">
            <PenTool className="w-4 h-4 mr-2" />
            Draw
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {showLearningInsights && userId && messages.length > 0 && (
          <LearningStyleInsights 
            userId={userId}
            onStyleChange={onLearningStyleChange}
          />
        )}
        
        {messages.map((chat) => {
          const enhancedChat = chat as EnhancedChatMessage;
          return (
            <div key={chat.id} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                chat.sender === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : enhancedChat.fallback 
                    ? 'bg-yellow-50 text-yellow-900 border border-yellow-200'
                    : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{chat.message}</p>
                
                {/* Images */}
                {enhancedChat.images && enhancedChat.images.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {enhancedChat.images.map((image, index) => (
                      <div key={index} className="bg-white p-2 rounded border">
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Image className="w-3 h-3" />
                          <span>{image}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Suggestions */}
                {enhancedChat.suggestions && enhancedChat.suggestions.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                      <Lightbulb className="w-3 h-3" />
                      <span>Suggestions:</span>
                    </div>
                    {enhancedChat.suggestions.map((suggestion, index) => (
                      <div key={index} className="text-xs text-gray-600 pl-4">
                        • {suggestion}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Provider info */}
                {enhancedChat.provider && enhancedChat.model && (
                  <div className="flex items-center justify-between mt-2">
                    <p className={`text-xs ${chat.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {chat.timestamp}
                    </p>
                    <div className="flex items-center space-x-1">
                      {enhancedChat.fallback && (
                        <RefreshCw className="w-3 h-3 text-yellow-600" />
                      )}
                      <span className={`text-xs ${chat.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {enhancedChat.provider}
                      </span>
                    </div>
                  </div>
                )}
                
                {!enhancedChat.provider && (
                  <p className={`text-xs mt-1 ${chat.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {chat.timestamp}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              placeholder="Ask your AI tutor anything..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-12"
              disabled={isLoading}
            />
            <button
              onClick={() => setIsRecording(!isRecording)}
              disabled={isLoading}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded disabled:opacity-50 ${
                isRecording ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={handleSendMessage} disabled={isLoading || !chatInput.trim()}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
      />
    </div>
  );
};
