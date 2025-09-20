'use client';
/**
 * @fileoverview Loading context provider for global loading states
 * 
 * This file is part of the Tether AI learning platform.
 * loading context provider for global loading states for the application.
 */


import React, { createContext, useContext } from 'react';
import { useLoadingStore } from '@/stores/loading';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface LoadingContextType {
  setLoading: (key: string, isLoading: boolean) => void;
  isLoading: (key: string) => boolean;
  clearLoading: (key: string) => void;
  clearAllLoading: () => void;
  getLoadingKeys: () => string[];
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoadingContext = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoadingContext must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: React.ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const loadingStore = useLoadingStore();

  return (
    <LoadingContext.Provider value={loadingStore}>
      {children}
      <GlobalLoadingIndicator />
    </LoadingContext.Provider>
  );
};

const GlobalLoadingIndicator: React.FC = () => {
  const loadingKeys = useLoadingStore((state) => state.getLoadingKeys());
  const isLoading = loadingKeys.length > 0;

  if (!isLoading) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-lg shadow-lg px-4 py-2 flex items-center space-x-2">
        <LoadingSpinner size="small" />
        <span className="text-sm text-gray-600">
          {loadingKeys.length === 1 ? 'Loading...' : `${loadingKeys.length} operations in progress`}
        </span>
      </div>
    </div>
  );
};
