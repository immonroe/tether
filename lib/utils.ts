/**
 * @fileoverview Utility functions and helper methods
 * 
 * This file is part of the Tether AI learning platform.
 * utility functions and helper methods for the application.
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
