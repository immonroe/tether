'use client';

import React, { useState, useRef } from 'react';
import { Upload, Mic, PenTool, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChatMessage } from '@/lib/types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage 
}) => {
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      onSendMessage(chatInput.trim());
      setChatInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">AI Tutor</h2>
          <p className="text-sm text-gray-500">Ask me anything about your studies</p>
        </div>
        <div className="flex items-center space-x-2">
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
        {messages.map((chat) => (
          <div key={chat.id} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              chat.sender === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              <p className="text-sm">{chat.message}</p>
              <p className={`text-xs mt-1 ${chat.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                {chat.timestamp}
              </p>
            </div>
          </div>
        ))}
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
            />
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded ${
                isRecording ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={handleSendMessage}>
            <Send className="w-4 h-4" />
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
