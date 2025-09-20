'use client';
/**
 * @fileoverview Flashcard study page component
 * 
 * This file is part of the Tether AI learning platform.
 * flashcard study page component for the application.
 */


import React, { useState } from 'react';
import { Plus, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { FlashcardStudy } from '@/components/flashcards/FlashcardStudy';
import { FlashcardLibrary } from '@/components/flashcards/FlashcardLibrary';
import { FlashcardCreator } from '@/components/flashcards/FlashcardCreator';
import { FlashcardStats } from '@/components/flashcards/FlashcardStats';
import { Flashcard } from '@/lib/types';
import { sm2Service } from '@/lib/ai/sm2Service';
import { flashcardImportExportService } from '@/lib/ai/flashcardImportExportService';

// Mock data with SM-2 fields
const mockFlashcards: Flashcard[] = [
  { 
    id: '1', 
    front: "What is the derivative of x²?", 
    back: "2x", 
    difficulty: "easy", 
    nextReview: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), 
    streak: 3, 
    deckId: 'math', 
    createdAt: new Date(), 
    updatedAt: new Date(),
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0
  },
  { 
    id: '2', 
    front: "Define integration by parts", 
    back: "∫u dv = uv - ∫v du", 
    difficulty: "medium", 
    nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), 
    streak: 1, 
    deckId: 'math', 
    createdAt: new Date(), 
    updatedAt: new Date(),
    easeFactor: 2.3,
    interval: 6,
    repetitions: 2
  },
  { 
    id: '3', 
    front: "What is the limit definition of a derivative?", 
    back: "f'(x) = lim(h→0) [f(x+h) - f(x)]/h", 
    difficulty: "hard", 
    nextReview: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), 
    streak: 5, 
    deckId: 'math', 
    createdAt: new Date(), 
    updatedAt: new Date(),
    easeFactor: 2.8,
    interval: 15,
    repetitions: 4
  },
];

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(mockFlashcards);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [showCreator, setShowCreator] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const handleNext = () => {
    setCurrentFlashcard((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setCurrentFlashcard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleRate = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    const currentCard = flashcards[currentFlashcard];
    if (currentCard) {
      const quality = sm2Service.getQualityFromRating(rating);
      const result = sm2Service.calculateNextReview(currentCard, quality);
      
      setFlashcards(prev => 
        prev.map(card => 
          card.id === currentCard.id ? result.flashcard : card
        )
      );
      
      // Move to next card
      handleNext();
    }
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
    const card = flashcards.find(c => c.id === cardId);
    if (card) {
      const resetCard = sm2Service.resetFlashcard(card);
      setFlashcards(prev => 
        prev.map(c => c.id === cardId ? resetCard : c)
      );
    }
  };

  const handleUpdateFlashcard = (card: Flashcard) => {
    setFlashcards(prev => 
      prev.map(c => c.id === card.id ? card : c)
    );
  };

  const handleExport = () => {
    const csvContent = flashcardImportExportService.exportToCSV(flashcards, { 
      format: 'csv', 
      includeMetadata: true 
    });
    flashcardImportExportService.downloadFile(csvContent, 'flashcards.csv', 'text/csv');
  };

  const handleImport = async (file: File) => {
    try {
      const result = await flashcardImportExportService.autoImport(file);
      
      if (result.success) {
        const newFlashcards = result.flashcards.map(flashcard => ({
          ...flashcard,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          updatedAt: new Date()
        }));
        
        setFlashcards(prev => [...prev, ...newFlashcards]);
        alert(`Successfully imported ${result.imported} flashcards!`);
      } else {
        alert(`Import failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      alert(`Import error: ${error}`);
    }
  };

  const handleSaveFlashcards = (newFlashcards: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    const flashcardsWithIds = newFlashcards.map(flashcard => ({
      ...flashcard,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0
    }));
    
    setFlashcards(prev => [...prev, ...flashcardsWithIds]);
    setShowCreator(false);
  };

  // Get study stats
  const studyStats = sm2Service.getStudyStats(flashcards);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Flashcards</h2>
          <p className="text-gray-600">Review and create flashcards for spaced repetition</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowStats(true)} variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => setShowCreator(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Flashcards
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Study Mode */}
        <Card className="md:col-span-2 p-6">
          <FlashcardStudy
            flashcards={flashcards}
            onUpdateFlashcard={handleUpdateFlashcard}
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
          onUpdateFlashcard={handleUpdateFlashcard}
        />
      </Card>

      {/* Flashcard Creator Modal */}
      <Modal
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        title="Create Flashcards"
        size="large"
      >
        <div className="p-6">
          <FlashcardCreator
            onSave={handleSaveFlashcards}
            onCancel={() => setShowCreator(false)}
            deckId="default"
          />
        </div>
      </Modal>

      {/* Analytics Modal */}
      <Modal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        title="Flashcard Analytics"
        size="large"
      >
        <div className="p-6">
          <FlashcardStats
            stats={studyStats}
            flashcards={flashcards}
            onExport={handleExport}
            onImport={handleImport}
          />
        </div>
      </Modal>
    </div>
  );
}
