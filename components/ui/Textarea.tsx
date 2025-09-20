'use client';
/**
 * @fileoverview Textarea component for multi-line text input
 * 
 * This file is part of the Tether AI learning platform.
 * textarea component for multi-line text input for the application.
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'error';
  size?: 'small' | 'medium' | 'large';
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', size = 'medium', ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
          {
            'border-red-300 focus:ring-red-500': variant === 'error',
            'h-8 px-2 py-1 text-xs': size === 'small',
            'h-10 px-3 py-2 text-sm': size === 'medium',
            'h-12 px-4 py-3 text-base': size === 'large',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
