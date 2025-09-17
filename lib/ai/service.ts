import { AIProvider, ChatMessage, AIResponse, AIOptions, AIConfig, LearningStyle } from './types';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GeminiProvider } from './providers/gemini';
import { HuggingFaceProvider } from './providers/huggingface';
import { OllamaProvider } from './providers/ollama';
import { FallbackProvider } from './providers/fallback';
import { learningStyleDetector, LearningStyleAnalysis } from './learningStyleDetector';

export class AIService {
  private providers: Map<string, AIProvider> = new Map();
  private config: AIConfig;
  private providersInitialized: boolean = false;

  constructor(config: AIConfig) {
    this.config = config;
    // Don't initialize providers in constructor - do it lazily
  }

  private initializeProviders() {
    // Initialize Gemini provider (free, no credit card required)
    console.log('🔧 AI Service: Initializing providers...');
    console.log('🔧 AI Service: NEXT_PUBLIC_GEMINI_API_KEY available:', !!process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    
    if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.log('🔧 AI Service: Adding Gemini provider');
      this.providers.set('gemini', new GeminiProvider(process.env.NEXT_PUBLIC_GEMINI_API_KEY));
    } else {
      console.log('🔧 AI Service: No Gemini API key found');
    }

    // Initialize OpenAI provider
    if (process.env.OPENAI_API_KEY) {
      this.providers.set('openai', new OpenAIProvider(process.env.OPENAI_API_KEY));
    }

    // Initialize Anthropic provider
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.set('anthropic', new AnthropicProvider(process.env.ANTHROPIC_API_KEY));
    }

    // Initialize Hugging Face provider (free tier available)
    if (process.env.HUGGINGFACE_API_KEY) {
      this.providers.set('huggingface', new HuggingFaceProvider(process.env.HUGGINGFACE_API_KEY));
    }

    // Initialize Ollama provider (local AI models)
    if (process.env.OLLAMA_BASE_URL) {
      this.providers.set('ollama', new OllamaProvider(process.env.OLLAMA_BASE_URL));
    }

    // Always add fallback provider
    this.providers.set('fallback', new FallbackProvider());
    
    console.log('🔧 AI Service: Available providers:', Array.from(this.providers.keys()));
  }

  async generateResponse(
    messages: ChatMessage[], 
    options: AIOptions = {}
  ): Promise<AIResponse> {
    // Initialize providers lazily if not done yet
    if (!this.providersInitialized) {
      this.initializeProviders();
      this.providersInitialized = true;
    }
    
    const providers = this.getProviderOrder();
    
    for (const providerName of providers) {
      const provider = this.providers.get(providerName);
      if (!provider) {
        console.log(`🔧 AI Service: Provider ${providerName} not found`);
        continue;
      }

      try {
        console.log(`🔧 AI Service: Trying provider ${providerName}...`);
        // Check if provider is available
        const isAvailable = await this.checkProviderAvailability(provider);
        console.log(`🔧 AI Service: Provider ${providerName} available:`, isAvailable);
        if (!isAvailable) {
          console.warn(`Provider ${providerName} is not available, trying next...`);
          continue;
        }

        // Generate response with timeout
        const response = await this.generateWithTimeout(provider, messages, options);
        console.log(`Successfully generated response using ${providerName}`);
        return response;

      } catch (error) {
        console.error(`Provider ${providerName} failed:`, error);
        continue;
      }
    }

    // If all providers fail, throw an error
    throw new Error('All AI providers are currently unavailable. Please try again later.');
  }

  private getProviderOrder(): string[] {
    const order = [this.config.primaryProvider];
    
    // Add fallback providers in order
    this.config.fallbackProviders.forEach(provider => {
      if (provider !== this.config.primaryProvider) {
        order.push(provider);
      }
    });

    // Always add fallback as last resort
    if (!order.includes('fallback')) {
      order.push('fallback');
    }

    return order;
  }

  private async checkProviderAvailability(provider: AIProvider): Promise<boolean> {
    try {
      return await Promise.race([
        provider.isAvailable(),
        new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ]);
    } catch {
      return false;
    }
  }

  private async generateWithTimeout(
    provider: AIProvider, 
    messages: ChatMessage[], 
    options: AIOptions
  ): Promise<AIResponse> {
    return Promise.race([
      provider.generateResponse(messages, options),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), this.config.timeout)
      )
    ]);
  }

  async detectLearningStyle(messages: ChatMessage[]): Promise<LearningStyle> {
    const analysis = learningStyleDetector.analyzeLearningStyle(messages);
    return analysis.detectedStyle;
  }

  // Enhanced learning style analysis
  async analyzeLearningStyle(messages: ChatMessage[]): Promise<LearningStyleAnalysis> {
    return learningStyleDetector.analyzeLearningStyle(messages);
  }

  // Format response based on learning style
  formatResponseForLearningStyle(content: string, learningStyle: LearningStyle): string {
    return learningStyleDetector.formatResponse(content, learningStyle);
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  getConfig(): AIConfig {
    return { ...this.config };
  }
}

// Default configuration
export const defaultAIConfig: AIConfig = {
  primaryProvider: 'gemini',
  fallbackProviders: ['openai', 'anthropic', 'huggingface', 'ollama', 'fallback'],
  defaultModel: 'gemini-2.5-flash',
  maxRetries: 3,
  timeout: 30000, // 30 seconds
};

// Create singleton instance
export const aiService = new AIService(defaultAIConfig);
