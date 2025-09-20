'use client';
/**
 * @fileoverview Error context provider for global error handling
 * 
 * This file is part of the Tether AI learning platform.
 * error context provider for global error handling for the application.
 */


import React, { createContext, useContext, useEffect } from 'react';
import { useErrorStore } from '@/stores/error';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import { AppError } from '@/lib/errors';

interface ErrorContextType {
  handleError: (error: unknown, context?: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useErrorHandler = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorHandler must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: React.ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const { addError } = useErrorStore();
  const { toasts, error: showErrorToast, removeToast } = useToast();

  const handleError = (error: unknown, context?: string) => {
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
    } else if (error instanceof Error) {
      appError = new AppError(error.message, 'UNKNOWN_ERROR', 500);
    } else {
      appError = new AppError('An unexpected error occurred', 'UNKNOWN_ERROR', 500);
    }

    // Add to error store
    addError(appError);

    // Show toast notification for user-facing errors
    if (appError.isOperational) {
      showErrorToast(
        'Something went wrong',
        appError.message,
        {
          duration: 8000,
          action: {
            label: 'Details',
            onClick: () => {
              // Could open a modal with more details
              console.error('Error details:', appError);
            },
          },
        }
      );
    }
  };

  // Global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(event.reason, 'Unhandled Promise Rejection');
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorContext.Provider value={{ handleError }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ErrorContext.Provider>
  );
};
