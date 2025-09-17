'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FlashcardStudy } from '@/components/flashcards/FlashcardStudy';
import { FlashcardLibrary } from '@/components/flashcards/FlashcardLibrary';
import { Flashcard } from '@/lib/types';

// Mock data
const mockFlashcards: Flashcard[] = [
  { id: '1', front: "What is the derivative of x²?", back: "2x", difficulty: "easy", nextReview: "in 2 hours", streak: 3, deckId: 'math', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', front: "Define integration by parts", back: "∫u dv = uv - ∫v du", difficulty: "medium", nextReview: "in 1 day", streak: 1, deckId: 'math', createdAt: new Date(), updatedAt: new Date() },
  { id: '3', front: "What is the limit definition of a derivative?", back: "f'(x) = lim(h→0) [f(x+h) - f(x)]/h", difficulty: "hard", nextReview: "in 3 days", streak: 5, deckId: 'math', createdAt: new Date(), updatedAt: new Date() },
];

export default function FlashcardsPage() {
  const [flashcards] = useState<Flashcard[]>(mockFlashcards);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);

  const handleNext = () => {
    setCurrentFlashcard((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setCurrentFlashcard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleRate = (rating: 'again' | 'hard' | 'good') => {
    console.log('Rated card:', rating);
    // TODO: Implement rating logic
  };

  const handleEdit = (card: Flashcard) => {
    console.log('Edit card:', card);
    // TODO: Implement edit logic
  };

  const handleDelete = (cardId: string) => {
    console.log('Delete card:', cardId);
    // TODO: Implement delete logic
  };

  const handleReset = (cardId: string) => {
    console.log('Reset card:', cardId);
    // TODO: Implement reset logic
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Flashcards</h2>
          <p className="text-gray-600">Review and create flashcards for spaced repetition</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Deck
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Study Mode */}
        <Card className="md:col-span-2 p-6">
          <FlashcardStudy
            flashcards={flashcards}
            currentIndex={currentFlashcard}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onRate={handleRate}
          />
        </Card>

        {/* Deck Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Review</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="text-gray-900">12/24</span>
              </div>
              <ProgressBar progress={50} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New</span>
                <Badge variant="info">5</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Due</span>
                <Badge variant="warning">12</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Reviewed</span>
                <Badge variant="success">7</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Flashcard Library */}
      <Card className="p-6">
        <FlashcardLibrary
          flashcards={flashcards}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReset={handleReset}
        />
      </Card>
    </div>
  );
}
