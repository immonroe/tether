/**
 * @fileoverview AI provider implementation
 * 
 * This file is part of the Tether AI learning platform.
 * ai provider implementation for the application.
 */

import { AIProvider, ChatMessage, AIResponse, AIOptions } from '../types';

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://api.openai.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async generateResponse(messages: ChatMessage[], options: AIOptions = {}): Promise<AIResponse> {
    const {
      temperature = 0.7,
      maxTokens = 1000,
      model = 'gpt-3.5-turbo',
      systemPrompt,
      learningStyle
    } = options;

    const systemMessage = systemPrompt || this.getDefaultSystemPrompt(learningStyle);
    
    const requestMessages = [
      { role: 'system', content: systemMessage },
      ...messages
    ];

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: requestMessages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0].message.content,
        usage: data.usage,
        model: data.model,
        provider: this.name,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`OpenAI request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getDefaultSystemPrompt(learningStyle?: string): string {
    const basePrompt = `You are an AI tutor designed to help students learn effectively. You should:
- Provide clear, accurate explanations
- Ask follow-up questions to check understanding
- Break down complex topics into manageable parts
- Use examples and analogies to illustrate concepts
- Encourage critical thinking and problem-solving
- Be patient and supportive while maintaining high standards`;

    const stylePrompts = {
      visual: 'Use visual descriptions, diagrams, and visual analogies. Suggest drawing or sketching concepts.',
      auditory: 'Use verbal explanations, storytelling, and encourage students to explain concepts out loud.',
      kinesthetic: 'Suggest hands-on activities, experiments, and physical examples. Use movement and action-based learning.',
      reading: 'Provide detailed written explanations, suggest reading materials, and use text-based examples.',
      mixed: 'Use a combination of visual, auditory, and kinesthetic approaches based on the topic.'
    };

    const stylePrompt = learningStyle ? stylePrompts[learningStyle as keyof typeof stylePrompts] || '' : '';
    
    return `${basePrompt}\n\n${stylePrompt}`.trim();
  }
}
