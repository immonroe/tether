/**
 * @fileoverview Global error state management
 * 
 * This file is part of the Tether AI learning platform.
 * global error state management for the application.
 */

import { create } from 'zustand';
import { AppError, logError } from '@/lib/errors';

interface ErrorState {
  errors: AppError[];
  addError: (error: AppError) => void;
  removeError: (errorId: string) => void;
  clearErrors: () => void;
  getLatestError: () => AppError | null;
}

export const useErrorStore = create<ErrorState>((set, get) => ({
  errors: [],
  
  addError: (error: AppError) => {
    const errorId = `${Date.now()}-${Math.random()}`;
    const errorWithId = { ...error, id: errorId } as AppError & { id: string };
    
    logError(error, 'ErrorStore');
    
    set((state) => ({
      errors: [...state.errors, errorWithId].slice(-10), // Keep only last 10 errors
    }));
  },
  
  removeError: (errorId: string) => {
    set((state) => ({
      errors: state.errors.filter((error) => (error as any).id !== errorId),
    }));
  },
  
  clearErrors: () => {
    set({ errors: [] });
  },
  
  getLatestError: () => {
    const { errors } = get();
    return errors.length > 0 ? errors[errors.length - 1] : null;
  },
}));
