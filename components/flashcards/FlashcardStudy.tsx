'use client';
/**
 * @fileoverview Flashcard study session component
 * 
 * This file is part of the Tether AI learning platform.
 * flashcard study session component for the application.
 */


import React, { useState } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Flashcard } from '@/lib/types';

interface FlashcardStudyProps {
  flashcards: Flashcard[];
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onRate: (rating: 'again' | 'hard' | 'good') => void;
}

export const FlashcardStudy: React.FC<FlashcardStudyProps> = ({
  flashcards,
  currentIndex,
  onNext,
  onPrevious,
  onRate
}) => {
  const [showBack, setShowFlashcardBack] = useState(false);
  const currentCard = flashcards[currentIndex];

  const handleRate = (rating: 'again' | 'hard' | 'good') => {
    onRate(rating);
    setShowFlashcardBack(false);
    onNext();
  };

  if (!currentCard) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No flashcards available</h3>
        <p className="text-gray-600">Create some flashcards to start studying!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Study Mode</h3>
        <div className="text-sm text-gray-500">
          Card {currentIndex + 1} of {flashcards.length}
        </div>
      </div>
      
      <div 
        className="min-h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center p-6 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setShowFlashcardBack(!showBack)}
      >
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 mb-2">
            {showBack ? currentCard.back : currentCard.front}
          </p>
          <p className="text-sm text-gray-500">
            {showBack ? "Answer" : "Click to reveal answer"}
          </p>
        </div>
      </div>
      
      {showBack && (
        <div className="flex justify-center space-x-4">
          <Button variant="danger" onClick={() => handleRate('again')}>
            <X className="w-4 h-4 mr-2" />
            Again
          </Button>
          <Button variant="secondary" onClick={() => handleRate('hard')}>
            Hard
          </Button>
          <Button onClick={() => handleRate('good')}>
            <Check className="w-4 h-4 mr-2" />
            Good
          </Button>
        </div>
      )}
    </div>
  );
};
