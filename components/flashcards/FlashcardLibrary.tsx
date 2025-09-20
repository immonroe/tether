'use client';
/**
 * @fileoverview Flashcard library and management component with SM-2 integration
 * 
 * This file is part of the Tether AI learning platform.
 * flashcard library and management component with SM-2 spaced repetition integration.
 */

import React, { useState } from 'react';
import { Search, Filter, RotateCcw, Calendar, TrendingUp, Brain, Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Flashcard } from '@/lib/types';
import { sm2Service } from '@/lib/ai/sm2Service';
import { NotificationBell } from '@/components/notifications';

interface FlashcardLibraryProps {
  flashcards: Flashcard[];
  userId?: string;
  onEdit: (card: Flashcard) => void;
  onDelete: (cardId: string) => void;
  onReset: (cardId: string) => void;
  onUpdateFlashcard: (card: Flashcard) => void;
}

export const FlashcardLibrary: React.FC<FlashcardLibraryProps> = ({
  flashcards,
  userId,
  onEdit,
  onDelete,
  onReset,
  onUpdateFlashcard
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'due' | 'new' | 'learning' | 'mastered'>('all');

  const filteredCards = flashcards.filter(card => {
    const matchesSearch = card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.back.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    const schedule = sm2Service.getStudySchedule(card);
    const isDue = new Date(card.nextReview) <= new Date();
    
    switch (filterType) {
      case 'due':
        return isDue;
      case 'new':
        return schedule.difficulty === 'New';
      case 'learning':
        return schedule.difficulty === 'Learning';
      case 'mastered':
        return schedule.difficulty === 'Mature' || schedule.difficulty === 'Mastered';
      default:
        return true;
    }
  });

  const handleReset = (cardId: string) => {
    const card = flashcards.find(c => c.id === cardId);
    if (card) {
      const resetCard = sm2Service.resetFlashcard(card);
      onUpdateFlashcard(resetCard);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Your Flashcards</h3>
        <div className="flex items-center space-x-2">
          {userId && <NotificationBell />}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Search cards..." 
              className="pl-9 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Cards</option>
            <option value="due">Due Today</option>
            <option value="new">New Cards</option>
            <option value="learning">Learning</option>
            <option value="mastered">Mastered</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-3">
        {filteredCards.map((card) => {
          const schedule = sm2Service.getStudySchedule(card);
          const isDue = new Date(card.nextReview) <= new Date();
          
          return (
            <div key={card.id} className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
              isDue ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
            }`}>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{card.front}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant={
                    schedule.difficulty === 'New' ? 'info' : 
                    schedule.difficulty === 'Learning' ? 'warning' : 
                    schedule.difficulty === 'Mature' ? 'success' : 'info'
                  }>
                    {schedule.difficulty}
                  </Badge>
                  
                  <Badge variant={card.difficulty === 'easy' ? 'success' : card.difficulty === 'medium' ? 'warning' : 'danger'}>
                    {card.difficulty}
                  </Badge>
                  
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {isDue ? 'Due now' : `Due ${new Date(card.nextReview).toLocaleDateString()}`}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <TrendingUp className="w-4 h-4" />
                    <span>Interval: {schedule.interval}d</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Brain className="w-4 h-4" />
                    <span>Ease: {card.easeFactor?.toFixed(2) || '2.50'}</span>
                  </div>
                  
                  <span className="text-sm text-gray-500">Streak: {card.streak || 0}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="small" onClick={() => onEdit(card)}>
                  Edit
                </Button>
                <Button variant="ghost" size="small" onClick={() => handleReset(card.id)}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
        
        {filteredCards.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No flashcards found matching your criteria.</p>
            <p className="text-sm">Try adjusting your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
