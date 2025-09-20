/**
 * @fileoverview AI provider implementation
 * 
 * This file is part of the Tether AI learning platform.
 * ai provider implementation for the application.
 */

import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';
import { AIProvider, ChatMessage, AIResponse, AIOptions } from '../types';

export interface GeminiModel {
  name: string;
  displayName: string;
  description: string;
  maxTokens: number;
  useCase: 'reasoning' | 'multimodal' | 'fast' | 'video' | 'image' | 'embeddings';
}

export class GeminiProvider implements AIProvider {
  name = 'gemini';
  private genAI: GoogleGenerativeAI;
  private model: string;
  private availableModels: Map<string, GenerativeModel> = new Map();

  // Available Gemini models
  public static readonly MODELS: Record<string, GeminiModel> = {
    'gemini-2.5-pro': {
      name: 'gemini-2.5-pro',
      displayName: 'Gemini 2.5 Pro',
      description: 'Most powerful model for complex reasoning and analysis',
      maxTokens: 8192,
      useCase: 'reasoning'
    },
    'gemini-2.5-flash': {
      name: 'gemini-2.5-flash',
      displayName: 'Gemini 2.5 Flash',
      description: 'Newest multimodal model with next generation features',
      maxTokens: 8192,
      useCase: 'multimodal'
    },
    'gemini-2.5-flash-lite': {
      name: 'gemini-2.5-flash-lite',
      displayName: 'Gemini 2.5 Flash Lite',
      description: 'Fastest and most cost-efficient model for high-frequency tasks',
      maxTokens: 4096,
      useCase: 'fast'
    },
    'gemini-2.5-flash-image': {
      name: 'gemini-2.5-flash-image',
      displayName: 'Gemini 2.5 Flash Image',
      description: 'Highly effective image generation model',
      maxTokens: 4096,
      useCase: 'image'
    }
  };

  constructor(apiKey: string, defaultModel: string = 'gemini-2.5-flash') {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = defaultModel;
    this.initializeModels();
  }

  private initializeModels() {
    // Initialize all available models
    Object.keys(GeminiProvider.MODELS).forEach(modelName => {
      this.availableModels.set(modelName, this.genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: GeminiProvider.MODELS[modelName].maxTokens,
        }
      }));
    });
  }

  async isAvailable(): Promise<boolean> {
    try {
      const model = this.availableModels.get(this.model);
      if (!model) return false;

      const result = await model.generateContent('Hello');
      return result.response !== null;
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

    const selectedModel = this.availableModels.get(model) || this.availableModels.get(this.model);
    if (!selectedModel) {
      throw new Error(`Model ${model} not available`);
    }

    // Format messages for Gemini
    const contents = this.formatMessagesForGemini(messages, systemPrompt, learningStyle);

    try {
      // Update generation config
      const generationConfig: GenerationConfig = {
        temperature: temperature,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: Math.min(maxTokens, GeminiProvider.MODELS[model]?.maxTokens || 1000),
      };

      const result = await selectedModel.generateContent({
        contents: contents,
        generationConfig
      });

      const response = await result.response;
      const content = response.text();

      return {
        content,
        usage: {
          promptTokens: this.estimateTokens(contents.map((c: any) => c.parts.map((p: any) => p.text).join('')).join('')),
          completionTokens: this.estimateTokens(content),
          totalTokens: this.estimateTokens(contents.map((c: any) => c.parts.map((p: any) => p.text).join('')).join('')) + this.estimateTokens(content),
        },
        model: model,
        provider: this.name,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Gemini request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatMessagesForGemini(messages: ChatMessage[], systemPrompt?: string, learningStyle?: string): any[] {
    const contents: any[] = [];

    // Add system prompt and learning style as the first part
    let systemContent = '';
    if (systemPrompt) {
      systemContent += systemPrompt;
    }
    if (learningStyle) {
      const styleContext = this.getLearningStyleContext(learningStyle);
      systemContent += (systemContent ? '\n\n' : '') + styleContext;
    }

    // Add system content if we have any
    if (systemContent) {
      contents.push({
        role: 'user',
        parts: [{ text: systemContent }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'I understand. I will act as an AI tutor and adapt my teaching style accordingly. How can I help you learn today?' }]
      });
    }

    // Add the actual conversation messages
    const userMessages = messages.filter(msg => msg.role === 'user');
    if (userMessages.length > 0) {
      const lastUserMessage = userMessages[userMessages.length - 1];
      contents.push({
        role: 'user',
        parts: [{ text: lastUserMessage.content }]
      });
    }

    return contents;
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

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  // Get available models
  getAvailableModels(): GeminiModel[] {
    return Object.values(GeminiProvider.MODELS);
  }

  // Get model by name
  getModel(name: string): GeminiModel | undefined {
    return GeminiProvider.MODELS[name];
  }

  // Switch default model
  setModel(modelName: string): void {
    if (GeminiProvider.MODELS[modelName]) {
      this.model = modelName;
    } else {
      throw new Error(`Model ${modelName} not available`);
    }
  }

  // Generate structured output (JSON)
  async generateStructuredOutput(
    messages: ChatMessage[], 
    schema: any, 
    options: AIOptions = {}
  ): Promise<any> {
    const structuredPrompt = this.formatMessagesForGemini(messages, options.systemPrompt, options.learningStyle);
    const jsonPrompt = `${structuredPrompt}

Please respond with valid JSON that matches this schema:
${JSON.stringify(schema, null, 2)}

Ensure your response is valid JSON and follows the exact structure specified.`;

    const response = await this.generateResponse([
      { role: 'user', content: jsonPrompt }
    ], options);

    try {
      return JSON.parse(response.content);
    } catch (error) {
      throw new Error('Failed to parse structured output as JSON');
    }
  }

  // Generate embeddings
  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
