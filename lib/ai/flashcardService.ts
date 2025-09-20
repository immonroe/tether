/**
 * @fileoverview AI-powered flashcard suggestion service
 * 
 * This file is part of the Tether AI learning platform.
 * ai-powered flashcard suggestion service for generating flashcards from content.
 */

import { aiService } from './service';
import { Flashcard } from '../types';

export interface FlashcardSuggestion {
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
  tags?: string[];
  category?: string;
}

export interface FlashcardGenerationOptions {
  content: string;
  subject?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count?: number;
  style?: 'factual' | 'conceptual' | 'application' | 'mixed';
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
}

export class FlashcardSuggestionService {
  private aiService = aiService;

  /**
   * Generate flashcard suggestions from content
   */
  async generateSuggestions(options: FlashcardGenerationOptions): Promise<FlashcardSuggestion[]> {
    const {
      content,
      subject = 'General',
      difficulty = 'medium',
      count = 5,
      style = 'mixed',
      learningStyle = 'mixed'
    } = options;

    const systemPrompt = this.buildSystemPrompt(subject, difficulty, style, learningStyle);
    const userPrompt = this.buildUserPrompt(content, count);

    try {
      const response = await this.aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      return this.parseFlashcardSuggestions(response.content);
    } catch (error) {
      console.error('Error generating flashcard suggestions:', error);
      throw new Error('Failed to generate flashcard suggestions. Please try again.');
    }
  }

  /**
   * Generate flashcards from a specific topic or question
   */
  async generateFromTopic(topic: string, options: Partial<FlashcardGenerationOptions> = {}): Promise<FlashcardSuggestion[]> {
    const content = `Topic: ${topic}\n\nGenerate comprehensive flashcards covering this topic from basic concepts to advanced applications.`;
    
    return this.generateSuggestions({
      content,
      subject: options.subject || 'General',
      difficulty: options.difficulty || 'medium',
      count: options.count || 8,
      style: options.style || 'mixed',
      learningStyle: options.learningStyle || 'mixed'
    });
  }

  /**
   * Generate flashcards from a PDF or document content
   */
  async generateFromDocument(documentContent: string, options: Partial<FlashcardGenerationOptions> = {}): Promise<FlashcardSuggestion[]> {
    return this.generateSuggestions({
      content: documentContent,
      subject: options.subject || 'Document',
      difficulty: options.difficulty || 'medium',
      count: options.count || 10,
      style: options.style || 'mixed',
      learningStyle: options.learningStyle || 'mixed'
    });
  }

  /**
   * Generate flashcards from chat conversation
   */
  async generateFromConversation(messages: string[], options: Partial<FlashcardGenerationOptions> = {}): Promise<FlashcardSuggestion[]> {
    const conversationContent = messages.join('\n\n');
    
    return this.generateSuggestions({
      content: conversationContent,
      subject: options.subject || 'Conversation',
      difficulty: options.difficulty || 'medium',
      count: options.count || 6,
      style: options.style || 'conceptual',
      learningStyle: options.learningStyle || 'mixed'
    });
  }

  private buildSystemPrompt(subject: string, difficulty: string, style: string, learningStyle: string): string {
    return `You are an expert educational content creator specializing in creating high-quality flashcards for spaced repetition learning.

Your task is to generate flashcards that are:
- Clear and concise
- Educationally effective
- Appropriate for the specified difficulty level
- Tailored to the learning style
- Covering the specified content style

Subject: ${subject}
Difficulty Level: ${difficulty}
Content Style: ${style}
Learning Style: ${learningStyle}

Guidelines:
1. Create flashcards that test understanding, not just memorization
2. Use clear, simple language appropriate for the difficulty level
3. Make questions specific and unambiguous
4. Provide comprehensive but concise answers
5. Include explanations for complex concepts
6. Suggest relevant tags and categories
7. Ensure variety in question types (definition, application, analysis, etc.)

Return your response as a JSON array of flashcard objects with the following structure:
{
  "front": "Question or prompt",
  "back": "Answer or explanation",
  "difficulty": "easy|medium|hard",
  "explanation": "Optional additional explanation",
  "tags": ["tag1", "tag2"],
  "category": "Category name"
}`;
  }

  private buildUserPrompt(content: string, count: number): string {
    return `Based on the following content, generate ${count} high-quality flashcards:

${content}

Please ensure the flashcards are:
- Educational and engaging
- Cover different aspects of the content
- Vary in difficulty appropriately
- Include both factual and conceptual questions
- Provide clear, accurate answers

Return only the JSON array, no additional text.`;
  }

  private parseFlashcardSuggestions(content: string): FlashcardSuggestion[] {
    try {
      // Clean the content to extract JSON
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const suggestions = JSON.parse(jsonMatch[0]);
      
      // Validate and normalize the suggestions
      return suggestions.map((suggestion: any, index: number) => ({
        front: suggestion.front || `Question ${index + 1}`,
        back: suggestion.back || 'Answer not provided',
        difficulty: suggestion.difficulty || 'medium',
        explanation: suggestion.explanation || '',
        tags: suggestion.tags || [],
        category: suggestion.category || 'General'
      }));
    } catch (error) {
      console.error('Error parsing flashcard suggestions:', error);
      // Return fallback suggestions
      return [{
        front: 'Sample Question',
        back: 'Sample Answer',
        difficulty: 'medium' as const,
        explanation: 'This is a sample flashcard. Please try generating suggestions again.',
        tags: ['sample'],
        category: 'General'
      }];
    }
  }

  /**
   * Convert suggestions to Flashcard objects
   */
  convertToFlashcards(suggestions: FlashcardSuggestion[], deckId: string): Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>[] {
    const now = new Date();
    const nextReview = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    return suggestions.map(suggestion => ({
      front: suggestion.front,
      back: suggestion.back,
      difficulty: suggestion.difficulty,
      nextReview: nextReview.toISOString(),
      streak: 0,
      deckId,
      // SM-2 Spaced Repetition Algorithm fields
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0
    }));
  }
}

// Export singleton instance
export const flashcardSuggestionService = new FlashcardSuggestionService();
