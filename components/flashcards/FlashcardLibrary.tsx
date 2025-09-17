'use client';

import React, { useState } from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Flashcard } from '@/lib/types';

interface FlashcardLibraryProps {
  flashcards: Flashcard[];
  onEdit: (card: Flashcard) => void;
  onDelete: (cardId: string) => void;
  onReset: (cardId: string) => void;
}

export const FlashcardLibrary: React.FC<FlashcardLibraryProps> = ({
  flashcards,
  onEdit,
  onDelete,
  onReset
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCards = flashcards.filter(card =>
    card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.back.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Your Flashcards</h3>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Search cards..." 
              className="pl-9 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="small">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        {filteredCards.map((card) => (
          <div key={card.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{card.front}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant={card.difficulty === 'easy' ? 'success' : card.difficulty === 'medium' ? 'warning' : 'danger'}>
                  {card.difficulty}
                </Badge>
                <span className="text-sm text-gray-500">Next review: {card.nextReview}</span>
                <span className="text-sm text-gray-500">Streak: {card.streak}</span>
              </div>
            </div>
            <Button variant="ghost" size="small" onClick={() => onReset(card.id)}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
