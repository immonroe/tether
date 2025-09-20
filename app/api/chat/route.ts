/**
 * @fileoverview API route for AI chat functionality
 * 
 * This file is part of the Tether AI learning platform.
 * api route for ai chat functionality for the application.
 */

import { NextRequest, NextResponse } from 'next/server';
import { tutorAIService } from '@/lib/ai/tutorService';
import { ChatMessage } from '@/lib/ai/types';

export async function POST(request: NextRequest) {
  const { messages, learningStyle, sessionId } = await request.json();
  const currentLearningStyle = learningStyle || 'mixed';


  try {
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Convert messages to the format expected by AI service
    const aiMessages: ChatMessage[] = messages.map((msg: any) => ({
      role: msg.sender === 'ai' ? 'assistant' : 'user',
      content: msg.message,
      timestamp: msg.timestamp || new Date().toISOString()
    }));

    // Generate enhanced tutor response with optional images
    const response = await tutorAIService.generateTutorResponse(aiMessages, {
      learningStyle: currentLearningStyle,
      temperature: 0.7,
      maxTokens: 1000,
      includeImages: true // Enable image generation for visual learning
    });

    return NextResponse.json({
      success: true,
      data: {
        message: response.content,
        images: response.images,
        suggestions: response.suggestions,
        timestamp: response.timestamp,
        provider: response.provider,
        model: response.model,
        usage: response.usage,
        learningStyle: response.learningStyle
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Enhanced error handling with fallback messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Check if it's a provider availability issue
    if (errorMessage.includes('All AI providers are currently unavailable')) {
      const fallbackResponse = tutorAIService.generateFallbackResponse('AI unavailable');
      return NextResponse.json({
        success: true,
        data: {
          message: fallbackResponse.content,
          suggestions: fallbackResponse.suggestions,
          timestamp: fallbackResponse.timestamp,
          provider: fallbackResponse.provider,
          model: fallbackResponse.model,
          learningStyle: currentLearningStyle,
          fallback: true
        }
      });
    }
    
    // Check if it's a timeout issue
    if (errorMessage.includes('timeout') || errorMessage.includes('Request timeout')) {
      const fallbackResponse = tutorAIService.generateFallbackResponse('AI timeout');
      return NextResponse.json({
        success: true,
        data: {
          message: 'The AI is taking longer than usual to respond. Please wait a moment and try again.',
          suggestions: [
            'Try rephrasing your question',
            'Wait a moment and try again',
            'Consider breaking down your question into smaller parts'
          ],
          timestamp: new Date().toISOString(),
          provider: 'fallback',
          model: 'fallback',
          learningStyle: currentLearningStyle,
          fallback: true
        }
      });
    }
    
    // Generic error with helpful message
    const fallbackResponse = tutorAIService.generateFallbackResponse('Generic error');
    return NextResponse.json({
      success: true,
      data: {
        message: fallbackResponse.content,
        suggestions: fallbackResponse.suggestions,
        timestamp: fallbackResponse.timestamp,
        provider: fallbackResponse.provider,
        model: fallbackResponse.model,
          learningStyle: currentLearningStyle,
        fallback: true
      }
    });
  }
}