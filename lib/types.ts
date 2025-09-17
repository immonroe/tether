// Core types for the Tether application

export interface User {
  id: string;
  name: string;
  email?: string;
  isGuest: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'ai';
  timestamp: string;
  sessionId?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  nextReview: string;
  streak: number;
  deckId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyGroup {
  id: string;
  name: string;
  members: number;
  subject: string;
  nextSession: string;
  status: 'active' | 'pending' | 'inactive';
  description?: string;
  maxMembers?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  icon: string;
  earnedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export interface StudySession {
  id: string;
  type: 'tutor' | 'flashcards' | 'group';
  subject: string;
  duration: number;
  completedAt: Date;
  score?: number;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'locked';
  progress: number;
  totalConcepts: number;
  completedConcepts: number;
  prerequisites?: string[];
}

export type PageId = 'dashboard' | 'tutor' | 'flashcards' | 'groups' | 'progress';

export interface SidebarItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}
