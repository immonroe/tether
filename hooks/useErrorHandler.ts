/**
 * @fileoverview Error handling and display hook
 * 
 * This file is part of the Tether AI learning platform.
 * error handling and display hook for the application.
 */

import { useCallback } from 'react';
import { useErrorHandler as useErrorHandlerContext } from '@/components/providers/ErrorProvider';
import { AppError } from '@/lib/errors';

export const useErrorHandler = () => {
  const { handleError } = useErrorHandlerContext();

  const handleAsyncError = useCallback(
    async <T>(
      operation: () => Promise<T>,
      context?: string
    ): Promise<T | null> => {
      try {
        return await operation();
      } catch (error) {
        handleError(error, context);
        return null;
      }
    },
    [handleError]
  );

  const handleApiError = useCallback(
    (error: unknown, context?: string) => {
      let appError: AppError;

      if (error instanceof AppError) {
        appError = error;
      } else if (error instanceof Error) {
        // Check if it's a network error
        if (error.message.includes('fetch') || error.message.includes('network')) {
          appError = new AppError('Network error. Please check your connection.', 'NETWORK_ERROR', 0);
        } else {
          appError = new AppError(error.message, 'API_ERROR', 500);
        }
      } else {
        appError = new AppError('An unexpected error occurred', 'UNKNOWN_ERROR', 500);
      }

      handleError(appError, context);
    },
    [handleError]
  );

  const handleValidationError = useCallback(
    (message: string, field?: string) => {
      const error = new AppError(message, 'VALIDATION_ERROR', 400);
      if (field) {
        error.message = `${field}: ${message}`;
      }
      handleError(error, 'Validation');
    },
    [handleError]
  );

  return {
    handleError,
    handleAsyncError,
    handleApiError,
    handleValidationError,
  };
};
