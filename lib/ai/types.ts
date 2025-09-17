// AI service types and interfaces

export interface AIProvider {
  name: string;
  generateResponse: (messages: ChatMessage[], options?: AIOptions) => Promise<AIResponse>;
  isAvailable: () => Promise<boolean>;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface AIOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  systemPrompt?: string;
  learningStyle?: LearningStyle;
  includeImages?: boolean;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  provider: string;
  timestamp: string;
}

export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';

export interface LearningStyleAnalysis {
  detectedStyle: LearningStyle;
  confidence: number;
  reasoning: string;
  suggestions: string[];
}

export interface AIConfig {
  primaryProvider: string;
  fallbackProviders: string[];
  defaultModel: string;
  maxRetries: number;
  timeout: number;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  learningStyle?: LearningStyle;
  createdAt: Date;
  updatedAt: Date;
}
