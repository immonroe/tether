/**
 * @fileoverview Flashcard import/export service for bulk operations
 * 
 * This file is part of the Tether AI learning platform.
 * Handles importing and exporting flashcards in various formats (CSV, JSON, Anki).
 */

import { Flashcard } from '../types';

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  flashcards: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>[];
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'anki';
  includeMetadata?: boolean;
  deckId?: string;
}

export class FlashcardImportExportService {
  /**
   * Import flashcards from CSV file
   */
  async importFromCSV(file: File): Promise<ImportResult> {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const errors: string[] = [];
      const flashcards: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>[] = [];

      // Skip header row if it exists
      const dataLines = lines[0].toLowerCase().includes('front') ? lines.slice(1) : lines;

      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i].trim();
        if (!line) continue;

        const columns = this.parseCSVLine(line);
        
        if (columns.length < 2) {
          errors.push(`Line ${i + 1}: Insufficient columns (need at least front and back)`);
          continue;
        }

        const [front, back, difficulty = 'medium', tags = '', deckId = 'default'] = columns;
        
        if (!front.trim() || !back.trim()) {
          errors.push(`Line ${i + 1}: Front and back cannot be empty`);
          continue;
        }

        const flashcard: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'> = {
          front: front.trim(),
          back: back.trim(),
          difficulty: this.validateDifficulty(difficulty.trim()) as 'easy' | 'medium' | 'hard',
          nextReview: new Date().toISOString(),
          streak: 0,
          deckId: deckId.trim() || 'default',
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0
        };

        flashcards.push(flashcard);
      }

      return {
        success: errors.length === 0,
        imported: flashcards.length,
        errors,
        flashcards
      };
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [`Failed to parse CSV file: ${error}`],
        flashcards: []
      };
    }
  }

  /**
   * Import flashcards from JSON file
   */
  async importFromJSON(file: File): Promise<ImportResult> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const errors: string[] = [];
      const flashcards: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>[] = [];

      // Handle both array and object with flashcards property
      const flashcardArray = Array.isArray(data) ? data : data.flashcards || [];

      for (let i = 0; i < flashcardArray.length; i++) {
        const item = flashcardArray[i];
        
        if (!item.front || !item.back) {
          errors.push(`Item ${i + 1}: Missing front or back property`);
          continue;
        }

        const flashcard: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'> = {
          front: item.front,
          back: item.back,
          difficulty: this.validateDifficulty(item.difficulty) as 'easy' | 'medium' | 'hard',
          nextReview: item.nextReview || new Date().toISOString(),
          streak: item.streak || 0,
          deckId: item.deckId || 'default',
          easeFactor: item.easeFactor || 2.5,
          interval: item.interval || 1,
          repetitions: item.repetitions || 0,
          lastReviewed: item.lastReviewed,
          quality: item.quality
        };

        flashcards.push(flashcard);
      }

      return {
        success: errors.length === 0,
        imported: flashcards.length,
        errors,
        flashcards
      };
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [`Failed to parse JSON file: ${error}`],
        flashcards: []
      };
    }
  }

  /**
   * Import flashcards from Anki export file
   */
  async importFromAnki(file: File): Promise<ImportResult> {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const errors: string[] = [];
      const flashcards: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Anki format: front\tback\t[tags]
        const parts = line.split('\t');
        
        if (parts.length < 2) {
          errors.push(`Line ${i + 1}: Invalid Anki format`);
          continue;
        }

        const [front, back, tags = ''] = parts;
        
        if (!front.trim() || !back.trim()) {
          errors.push(`Line ${i + 1}: Front and back cannot be empty`);
          continue;
        }

        const flashcard: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'> = {
          front: front.trim(),
          back: back.trim(),
          difficulty: 'medium', // Default for Anki imports
          nextReview: new Date().toISOString(),
          streak: 0,
          deckId: 'anki-import',
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0
        };

        flashcards.push(flashcard);
      }

      return {
        success: errors.length === 0,
        imported: flashcards.length,
        errors,
        flashcards
      };
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [`Failed to parse Anki file: ${error}`],
        flashcards: []
      };
    }
  }

  /**
   * Export flashcards to CSV format
   */
  exportToCSV(flashcards: Flashcard[], options: ExportOptions = { format: 'csv' }): string {
    const headers = options.includeMetadata 
      ? ['front', 'back', 'difficulty', 'deckId', 'easeFactor', 'interval', 'repetitions', 'streak', 'nextReview']
      : ['front', 'back', 'difficulty'];

    const csvLines = [headers.join(',')];

    flashcards.forEach(card => {
      const row = options.includeMetadata
        ? [
            this.escapeCSV(card.front),
            this.escapeCSV(card.back),
            card.difficulty,
            card.deckId,
            card.easeFactor?.toString() || '2.5',
            card.interval?.toString() || '1',
            card.repetitions?.toString() || '0',
            card.streak?.toString() || '0',
            card.nextReview
          ]
        : [
            this.escapeCSV(card.front),
            this.escapeCSV(card.back),
            card.difficulty
          ];
      
      csvLines.push(row.join(','));
    });

    return csvLines.join('\n');
  }

  /**
   * Export flashcards to JSON format
   */
  exportToJSON(flashcards: Flashcard[], options: ExportOptions = { format: 'json' }): string {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      totalCards: flashcards.length,
      deckId: options.deckId || 'default',
      flashcards: options.includeMetadata 
        ? flashcards.map(card => ({
            front: card.front,
            back: card.back,
            difficulty: card.difficulty,
            deckId: card.deckId,
            easeFactor: card.easeFactor,
            interval: card.interval,
            repetitions: card.repetitions,
            streak: card.streak,
            nextReview: card.nextReview,
            lastReviewed: card.lastReviewed,
            quality: card.quality
          }))
        : flashcards.map(card => ({
            front: card.front,
            back: card.back,
            difficulty: card.difficulty,
            deckId: card.deckId
          }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export flashcards to Anki format
   */
  exportToAnki(flashcards: Flashcard[]): string {
    return flashcards
      .map(card => `${card.front}\t${card.back}\t${card.deckId}`)
      .join('\n');
  }

  /**
   * Download file with given content and filename
   */
  downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Parse CSV line handling quoted fields
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  /**
   * Escape CSV field content
   */
  private escapeCSV(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  /**
   * Validate difficulty level
   */
  private validateDifficulty(difficulty: string): string {
    const validDifficulties = ['easy', 'medium', 'hard'];
    const normalized = difficulty.toLowerCase().trim();
    return validDifficulties.includes(normalized) ? normalized : 'medium';
  }

  /**
   * Get file type from filename
   */
  getFileType(filename: string): 'csv' | 'json' | 'anki' | 'unknown' {
    const extension = filename.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'csv':
        return 'csv';
      case 'json':
        return 'json';
      case 'txt':
        return 'anki';
      default:
        return 'unknown';
    }
  }

  /**
   * Auto-detect and import file based on extension
   */
  async autoImport(file: File): Promise<ImportResult> {
    const fileType = this.getFileType(file.name);
    
    switch (fileType) {
      case 'csv':
        return this.importFromCSV(file);
      case 'json':
        return this.importFromJSON(file);
      case 'anki':
        return this.importFromAnki(file);
      default:
        return {
          success: false,
          imported: 0,
          errors: [`Unsupported file type: ${file.name}`],
          flashcards: []
        };
    }
  }
}

// Export singleton instance
export const flashcardImportExportService = new FlashcardImportExportService();
