/**
 * @fileoverview SM-2 Spaced Repetition Algorithm Service
 * 
 * This file is part of the Tether AI learning platform.
 * Implements the SM-2 spaced repetition algorithm for optimal flashcard review scheduling.
 */

import { Flashcard } from '../types';

export interface ReviewResult {
  flashcard: Flashcard;
  nextReview: Date;
  updatedInterval: number;
  updatedEaseFactor: number;
  updatedRepetitions: number;
  isNew: boolean;
  isGraduated: boolean;
}

export interface ReviewSession {
  id: string;
  flashcards: Flashcard[];
  dueCards: Flashcard[];
  completedCards: Flashcard[];
  startTime: Date;
  endTime?: Date;
  totalCards: number;
  correctAnswers: number;
  accuracy: number;
}

export interface StudyStats {
  totalCards: number;
  dueCards: number;
  newCards: number;
  reviewCards: number;
  averageEaseFactor: number;
  averageInterval: number;
  longestStreak: number;
  totalReviews: number;
  accuracyRate: number;
}

export class SM2SpacedRepetitionService {
  // SM-2 Algorithm constants
  private readonly INITIAL_EASE_FACTOR = 2.5;
  private readonly MINIMUM_EASE_FACTOR = 1.3;
  private readonly QUALITY_AGAIN = 0;
  private readonly QUALITY_HARD = 1;
  private readonly QUALITY_GOOD = 2;
  private readonly QUALITY_EASY = 3;

  /**
   * Calculate the next review date and update flashcard parameters based on user performance
   */
  calculateNextReview(flashcard: Flashcard, quality: number): ReviewResult {
    const now = new Date();
    let updatedFlashcard = { ...flashcard };
    
    // Initialize SM-2 parameters if this is the first review
    if (updatedFlashcard.repetitions === undefined || updatedFlashcard.repetitions === 0) {
      updatedFlashcard.easeFactor = this.INITIAL_EASE_FACTOR;
      updatedFlashcard.interval = 1;
      updatedFlashcard.repetitions = 0;
    }

    // Update ease factor based on quality
    const newEaseFactor = this.calculateEaseFactor(
      updatedFlashcard.easeFactor,
      quality
    );

    // Calculate new interval based on repetitions and ease factor
    let newInterval: number;
    let newRepetitions: number;

    if (quality < this.QUALITY_GOOD) {
      // Failed review - reset repetitions
      newRepetitions = 0;
      newInterval = 1;
    } else {
      // Successful review
      newRepetitions = updatedFlashcard.repetitions + 1;
      
      if (newRepetitions === 1) {
        newInterval = 1;
      } else if (newRepetitions === 2) {
        newInterval = 6;
      } else {
        newInterval = Math.round(updatedFlashcard.interval * newEaseFactor);
      }
    }

    // Calculate next review date
    const nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

    // Update flashcard with new values
    const updatedFlashcardResult = {
      ...updatedFlashcard,
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: newRepetitions,
      nextReview: nextReview.toISOString(),
      lastReviewed: now.toISOString(),
      quality: quality,
      streak: quality >= this.QUALITY_GOOD ? updatedFlashcard.streak + 1 : 0
    };

    return {
      flashcard: updatedFlashcardResult,
      nextReview: nextReview,
      updatedInterval: newInterval,
      updatedEaseFactor: newEaseFactor,
      updatedRepetitions: newRepetitions,
      isNew: updatedFlashcard.repetitions === 0,
      isGraduated: newRepetitions >= 3
    };
  }

  /**
   * Calculate ease factor based on current ease factor and quality rating
   */
  private calculateEaseFactor(currentEaseFactor: number, quality: number): number {
    let newEaseFactor = currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    // Ensure ease factor doesn't go below minimum
    return Math.max(newEaseFactor, this.MINIMUM_EASE_FACTOR);
  }

  /**
   * Get flashcards that are due for review
   */
  getDueFlashcards(flashcards: Flashcard[]): Flashcard[] {
    const now = new Date();
    
    return flashcards.filter(card => {
      const nextReviewDate = new Date(card.nextReview);
      return nextReviewDate <= now;
    }).sort((a, b) => {
      // Sort by next review date (earliest first)
      return new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime();
    });
  }

  /**
   * Get new flashcards (never reviewed)
   */
  getNewFlashcards(flashcards: Flashcard[]): Flashcard[] {
    return flashcards.filter(card => 
      card.repetitions === undefined || card.repetitions === 0
    );
  }

  /**
   * Get review flashcards (previously reviewed)
   */
  getReviewFlashcards(flashcards: Flashcard[]): Flashcard[] {
    return flashcards.filter(card => 
      card.repetitions !== undefined && card.repetitions > 0
    );
  }

  /**
   * Create a study session with due cards
   */
  createStudySession(flashcards: Flashcard[], maxCards: number = 20): ReviewSession {
    const dueCards = this.getDueFlashcards(flashcards);
    const newCards = this.getNewFlashcards(flashcards);
    
    // Mix due cards and new cards, prioritizing due cards
    const sessionCards = [
      ...dueCards.slice(0, Math.min(dueCards.length, maxCards)),
      ...newCards.slice(0, Math.max(0, maxCards - dueCards.length))
    ];

    return {
      id: `session_${Date.now()}`,
      flashcards: sessionCards,
      dueCards: dueCards,
      completedCards: [],
      startTime: new Date(),
      totalCards: sessionCards.length,
      correctAnswers: 0,
      accuracy: 0
    };
  }

  /**
   * Update study session with completed card
   */
  updateStudySession(session: ReviewSession, flashcard: Flashcard, quality: number): ReviewSession {
    const reviewResult = this.calculateNextReview(flashcard, quality);
    const updatedFlashcard = reviewResult.flashcard;
    
    // Update the flashcard in the session
    const updatedFlashcards = session.flashcards.map(card => 
      card.id === flashcard.id ? updatedFlashcard : card
    );

    const completedCards = [...session.completedCards, updatedFlashcard];
    const correctAnswers = session.correctAnswers + (quality >= this.QUALITY_GOOD ? 1 : 0);
    const accuracy = (correctAnswers / completedCards.length) * 100;

    return {
      ...session,
      flashcards: updatedFlashcards,
      completedCards,
      correctAnswers,
      accuracy
    };
  }

  /**
   * Finish study session
   */
  finishStudySession(session: ReviewSession): ReviewSession {
    return {
      ...session,
      endTime: new Date()
    };
  }

  /**
   * Get study statistics for a set of flashcards
   */
  getStudyStats(flashcards: Flashcard[]): StudyStats {
    const dueCards = this.getDueFlashcards(flashcards);
    const newCards = this.getNewFlashcards(flashcards);
    const reviewCards = this.getReviewFlashcards(flashcards);
    
    const totalReviews = flashcards.reduce((sum, card) => sum + (card.repetitions || 0), 0);
    const averageEaseFactor = flashcards.reduce((sum, card) => sum + (card.easeFactor || this.INITIAL_EASE_FACTOR), 0) / flashcards.length;
    const averageInterval = flashcards.reduce((sum, card) => sum + (card.interval || 0), 0) / flashcards.length;
    const longestStreak = Math.max(...flashcards.map(card => card.streak || 0), 0);
    
    // Calculate accuracy rate based on quality ratings
    const cardsWithQuality = flashcards.filter(card => card.quality !== undefined);
    const accuracyRate = cardsWithQuality.length > 0 
      ? (cardsWithQuality.reduce((sum, card) => sum + (card.quality || 0), 0) / cardsWithQuality.length) / 5 * 100
      : 0;

    return {
      totalCards: flashcards.length,
      dueCards: dueCards.length,
      newCards: newCards.length,
      reviewCards: reviewCards.length,
      averageEaseFactor: Math.round(averageEaseFactor * 100) / 100,
      averageInterval: Math.round(averageInterval * 100) / 100,
      longestStreak,
      totalReviews,
      accuracyRate: Math.round(accuracyRate * 100) / 100
    };
  }

  /**
   * Get quality rating from user input
   */
  getQualityFromRating(rating: 'again' | 'hard' | 'good' | 'easy'): number {
    switch (rating) {
      case 'again':
        return this.QUALITY_AGAIN;
      case 'hard':
        return this.QUALITY_HARD;
      case 'good':
        return this.QUALITY_GOOD;
      case 'easy':
        return this.QUALITY_EASY;
      default:
        return this.QUALITY_GOOD;
    }
  }

  /**
   * Get recommended study schedule for a flashcard
   */
  getStudySchedule(flashcard: Flashcard): { interval: number; nextReview: Date; difficulty: string } {
    const now = new Date();
    const nextReview = new Date(flashcard.nextReview);
    const daysUntilReview = Math.ceil((nextReview.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let difficulty = 'New';
    if (flashcard.repetitions && flashcard.repetitions > 0) {
      if (flashcard.repetitions < 3) {
        difficulty = 'Learning';
      } else if (flashcard.interval && flashcard.interval < 7) {
        difficulty = 'Young';
      } else if (flashcard.interval && flashcard.interval < 30) {
        difficulty = 'Mature';
      } else {
        difficulty = 'Mastered';
      }
    }

    return {
      interval: flashcard.interval || 1,
      nextReview: nextReview,
      difficulty
    };
  }

  /**
   * Reset flashcard progress (for when user wants to start over)
   */
  resetFlashcard(flashcard: Flashcard): Flashcard {
    return {
      ...flashcard,
      easeFactor: this.INITIAL_EASE_FACTOR,
      interval: 1,
      repetitions: 0,
      streak: 0,
      nextReview: new Date().toISOString(),
      lastReviewed: undefined,
      quality: undefined
    };
  }
}

// Export singleton instance
export const sm2Service = new SM2SpacedRepetitionService();
