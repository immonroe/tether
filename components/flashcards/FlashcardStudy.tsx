'use client';
/**
 * @fileoverview Flashcard study session component with SM-2 spaced repetition
 * 
 * This file is part of the Tether AI learning platform.
 * flashcard study session component with SM-2 spaced repetition algorithm integration.
 */

import React, { useState, useEffect } from 'react';
import { X, Check, RotateCcw, Clock, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Flashcard } from '@/lib/types';
import { sm2Service, ReviewSession, StudyStats } from '@/lib/ai/sm2Service';
import { notificationService } from '@/lib/ai/notificationService';

interface FlashcardStudyProps {
  flashcards: Flashcard[];
  userId?: string;
  onUpdateFlashcard: (flashcard: Flashcard) => void;
  onSessionComplete?: (session: ReviewSession) => void;
}

export const FlashcardStudy: React.FC<FlashcardStudyProps> = ({
  flashcards,
  userId,
  onUpdateFlashcard,
  onSessionComplete
}) => {
  const [showBack, setShowFlashcardBack] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [studyStats, setStudyStats] = useState<StudyStats | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Initialize study session
  useEffect(() => {
    if (flashcards.length > 0) {
      const newSession = sm2Service.createStudySession(flashcards, 20);
      setSession(newSession);
      setStudyStats(sm2Service.getStudyStats(flashcards));
    }
  }, [flashcards]);

  const currentCard = session?.flashcards[currentIndex];

  const handleRate = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!session || !currentCard) return;

    const quality = sm2Service.getQualityFromRating(rating);
    const updatedSession = sm2Service.updateStudySession(session, currentCard, quality);
    
    // Update the flashcard in the parent component
    const updatedFlashcard = updatedSession.flashcards.find(card => card.id === currentCard.id);
    if (updatedFlashcard) {
      onUpdateFlashcard(updatedFlashcard);
    }

    setSession(updatedSession);
    setShowFlashcardBack(false);

    // Move to next card or complete session
    if (currentIndex + 1 < session.flashcards.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Session complete
      const completedSession = sm2Service.finishStudySession(updatedSession);
      setSession(completedSession);
      setSessionComplete(true);
      
      // Record study session for notifications and streak tracking
      if (userId) {
        notificationService.recordStudySession(userId).catch(console.error);
      }
      
      onSessionComplete?.(completedSession);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowFlashcardBack(false);
    setSessionComplete(false);
    if (flashcards.length > 0) {
      const newSession = sm2Service.createStudySession(flashcards, 20);
      setSession(newSession);
    }
  };

  if (!session || !currentCard) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No flashcards available</h3>
        <p className="text-gray-600">Create some flashcards to start studying!</p>
      </Card>
    );
  }

  if (sessionComplete) {
    return (
      <Card className="p-6 text-center">
        <div className="space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Session Complete!</h3>
          <div className="space-y-2">
            <p className="text-gray-600">
              You reviewed {session.completedCards.length} cards with {session.accuracy.toFixed(1)}% accuracy
            </p>
            <div className="flex justify-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Target className="w-4 h-4 mr-1" />
                {session.correctAnswers} correct
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {session.endTime ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60) : 0} min
              </span>
            </div>
          </div>
          <Button onClick={handleRestart} className="mt-4">
            <RotateCcw className="w-4 h-4 mr-2" />
            Study Again
          </Button>
        </div>
      </Card>
    );
  }

  const progress = ((currentIndex + 1) / session.flashcards.length) * 100;
  const schedule = sm2Service.getStudySchedule(currentCard);

  return (
    <div className="space-y-4">
      {/* Header with progress and stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Study Mode</h3>
          <div className="text-sm text-gray-500">
            Card {currentIndex + 1} of {session.flashcards.length}
          </div>
        </div>
        
        <ProgressBar progress={progress} className="h-2" />
        
        {/* Card difficulty and interval info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <Badge variant={schedule.difficulty === 'New' ? 'info' : 
                           schedule.difficulty === 'Learning' ? 'warning' : 
                           schedule.difficulty === 'Mature' ? 'success' : 'info'}>
              {schedule.difficulty}
            </Badge>
            <span className="text-gray-500">
              Interval: {schedule.interval} day{schedule.interval !== 1 ? 's' : ''}
            </span>
            <span className="text-gray-500">
              Ease: {currentCard.easeFactor?.toFixed(2) || '2.50'}
            </span>
          </div>
          <div className="flex items-center text-gray-500">
            <TrendingUp className="w-4 h-4 mr-1" />
            {currentCard.streak || 0} streak
          </div>
        </div>
      </div>
      
      {/* Flashcard content */}
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
      
      {/* Rating buttons */}
      {showBack && (
        <div className="space-y-3">
          <p className="text-center text-sm text-gray-600">How well did you know this?</p>
          <div className="flex justify-center space-x-2">
            <Button 
              variant="danger" 
              size="small"
              onClick={() => handleRate('again')}
              className="flex-1 max-w-20"
            >
              <X className="w-4 h-4 mr-1" />
              Again
            </Button>
            <Button 
              variant="secondary" 
              size="small"
              onClick={() => handleRate('hard')}
              className="flex-1 max-w-20"
            >
              Hard
            </Button>
            <Button 
              size="small"
              onClick={() => handleRate('good')}
              className="flex-1 max-w-20"
            >
              <Check className="w-4 h-4 mr-1" />
              Good
            </Button>
            <Button 
              variant="primary" 
              size="small"
              onClick={() => handleRate('easy')}
              className="flex-1 max-w-20"
            >
              Easy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
