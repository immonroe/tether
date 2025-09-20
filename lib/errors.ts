/**
 * @fileoverview Custom error classes and error handling utilities
 * 
 * This file is part of the Tether AI learning platform.
 * custom error classes and error handling utilities for the application.
 */

// Custom error classes for better error handling
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public isOperational: boolean;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    if (field) {
      this.message = `${field}: ${message}`;
    }
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
    this.isOperational = false;
  }
}

export class ApiError extends AppError {
  constructor(message: string, statusCode: number = 500) {
    super(message, 'API_ERROR', statusCode);
    this.name = 'ApiError';
  }
}

// Error handling utilities
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const isNetworkError = (error: unknown): error is NetworkError => {
  return error instanceof NetworkError;
};

export const isOperationalError = (error: unknown): boolean => {
  return isAppError(error) && error.isOperational;
};

export const getErrorMessage = (error: unknown): string => {
  if (isAppError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};

export const getErrorCode = (error: unknown): string => {
  if (isAppError(error)) {
    return error.code;
  }
  
  return 'UNKNOWN_ERROR';
};

export const getErrorStatusCode = (error: unknown): number => {
  if (isAppError(error)) {
    return error.statusCode;
  }
  
  return 500;
};

// Error logging utility
export const logError = (error: unknown, context?: string) => {
  const timestamp = new Date().toISOString();
  const message = getErrorMessage(error);
  const code = getErrorCode(error);
  
  console.error(`[${timestamp}] ${context ? `[${context}] ` : ''}Error:`, {
    message,
    code,
    stack: error instanceof Error ? error.stack : undefined,
    context,
  });
  
  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, or similar
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { tags: { context } });
  }
};
