'use client';
/**
 * @fileoverview Checkbox component
 * 
 * This file is part of the Tether AI learning platform.
 * Reusable checkbox component for the application.
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  className,
  id,
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn('flex items-center', className)}>
      <input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={cn(
          'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />
      {label && (
        <label
          htmlFor={checkboxId}
          className={cn(
            'ml-2 text-sm text-gray-700',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
};
