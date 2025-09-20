/**
 * @fileoverview Error page component for application errors
 * 
 * This file is part of the Tether AI learning platform.
 * error page component for application errors for the application.
 */

import React from 'react';
import { Button } from '@/components/ui/Button';
import { AppError, getErrorMessage, getErrorCode } from '@/lib/errors';

interface ErrorPageProps {
  error?: AppError | Error | null;
  title?: string;
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  error,
  title = 'Something went wrong',
  message,
  showRetry = true,
  onRetry,
  onGoHome,
}) => {
  const errorMessage = message || (error ? getErrorMessage(error) : 'An unexpected error occurred');
  const errorCode = error ? getErrorCode(error) : 'UNKNOWN_ERROR';

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h1>
        
        <p className="text-gray-600 mb-4">
          {errorMessage}
        </p>
        
        {process.env.NODE_ENV === 'development' && errorCode !== 'UNKNOWN_ERROR' && (
          <p className="text-sm text-gray-500 mb-4">
            Error Code: {errorCode}
          </p>
        )}
        
        <div className="space-y-2">
          {showRetry && (
            <Button onClick={handleRetry} className="w-full">
              Try Again
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={handleGoHome}
            className="w-full"
          >
            Go Home
          </Button>
        </div>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto max-h-40">
              {error.stack || JSON.stringify(error, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};
