/**
 * @fileoverview AI provider implementation
 * 
 * This file is part of the Tether AI learning platform.
 * ai provider implementation for the application.
 */

import { AIProvider, ChatMessage, AIResponse, AIOptions } from '../types';

export class OllamaProvider implements AIProvider {
  name = 'ollama';
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'llama2') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
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
      model = this.model,
      systemPrompt,
      learningStyle
    } = options;

    // Convert messages to Ollama format
    const ollamaMessages = this.formatMessagesForOllama(messages, systemPrompt, learningStyle);

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: ollamaMessages,
          options: {
            temperature: temperature,
            num_predict: maxTokens,
          },
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.message.content,
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
        model: data.model || model,
        provider: this.name,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Ollama request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatMessagesForOllama(messages: ChatMessage[], systemPrompt?: string, learningStyle?: string): Array<{role: string, content: string}> {
    const ollamaMessages: Array<{role: string, content: string}> = [];

    // Add system prompt if provided
    if (systemPrompt) {
      ollamaMessages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    // Add learning style context
    if (learningStyle) {
      const styleContext = this.getLearningStyleContext(learningStyle);
      ollamaMessages.push({
        role: 'system',
        content: `Learning Style Context: ${styleContext}`
      });
    }

    // Convert messages
    for (const message of messages) {
      ollamaMessages.push({
        role: message.role,
        content: message.content
      });
    }

    return ollamaMessages;
  }

  private getLearningStyleContext(learningStyle: string): string {
    const contexts = {
      visual: 'Focus on visual descriptions, diagrams, and visual analogies. Suggest drawing or sketching concepts.',
      auditory: 'Use verbal explanations, storytelling, and encourage students to explain concepts out loud.',
      kinesthetic: 'Suggest hands-on activities, experiments, and physical examples. Use movement and action-based learning.',
      reading: 'Provide detailed written explanations, suggest reading materials, and use text-based examples.',
      mixed: 'Use a combination of visual, auditory, and kinesthetic approaches based on the topic.'
    };

    return contexts[learningStyle as keyof typeof contexts] || contexts.mixed;
  }

  // Method to check available models
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch {
      return [];
    }
  }

  // Method to pull a model if not available
  async pullModel(modelName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
          stream: false
        }),
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
}
