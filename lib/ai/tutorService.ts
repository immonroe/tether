import { AIProvider, ChatMessage, AIResponse, AIOptions } from './types';
import { GeminiProvider } from './providers/gemini';
import { aiService } from './service';

export interface TutorResponse {
  content: string;
  images?: string[];
  suggestions?: string[];
  learningStyle?: string;
  provider: string;
  model: string;
  timestamp: string;
  usage?: any;
}

export interface ImageGenerationRequest {
  prompt: string;
  style?: 'educational' | 'diagram' | 'illustration' | 'photorealistic';
  size?: 'small' | 'medium' | 'large';
}

export class TutorAIService {
  private aiService = aiService;
  private geminiProvider: GeminiProvider | null = null;

  constructor() {
    // Initialize Gemini provider if available
    if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      this.geminiProvider = new GeminiProvider(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    }
  }

  /**
   * Generate a comprehensive tutor response with optional images
   */
  async generateTutorResponse(
    messages: ChatMessage[], 
    options: AIOptions = {}
  ): Promise<TutorResponse> {
    const {
      learningStyle = 'mixed',
      temperature = 0.7,
      maxTokens = 1000,
      includeImages = false
    } = options;

    try {
      // Generate the main response
      const response = await this.aiService.generateResponse(messages, {
        learningStyle,
        temperature,
        maxTokens,
        systemPrompt: this.getTutorSystemPrompt(learningStyle)
      });

      // Check if the response suggests visual content
      const shouldGenerateImages = includeImages && this.shouldGenerateImage(response.content);
      
      let images: string[] = [];
      if (shouldGenerateImages && this.geminiProvider) {
        try {
          const imagePrompts = this.extractImagePrompts(response.content);
          images = await this.generateImages(imagePrompts);
        } catch (error) {
          console.warn('Image generation failed:', error);
          // Continue without images
        }
      }

      // Extract learning suggestions
      const suggestions = this.extractSuggestions(response.content);

      return {
        content: response.content,
        images,
        suggestions,
        learningStyle,
        provider: response.provider,
        model: response.model,
        timestamp: response.timestamp,
        usage: response.usage
      };

    } catch (error) {
      console.error('Tutor response generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate images for educational content
   */
  async generateImages(requests: ImageGenerationRequest[]): Promise<string[]> {
    if (!this.geminiProvider) {
      throw new Error('Gemini provider not available for image generation');
    }

    const images: string[] = [];
    
    for (const request of requests) {
      try {
        // Use Gemini's image generation capabilities
        const imagePrompt = this.buildImagePrompt(request);
        
        // For now, we'll use a placeholder approach since Gemini 2.5 Flash Image
        // might not be available in the current API. In a real implementation,
        // you would call the image generation endpoint here.
        
        // Placeholder: Return a description of what image would be generated
        images.push(`[Image: ${imagePrompt}]`);
        
      } catch (error) {
        console.warn(`Failed to generate image for prompt: ${request.prompt}`, error);
      }
    }

    return images;
  }

  /**
   * Analyze if a response would benefit from visual content
   */
  private shouldGenerateImage(content: string): boolean {
    const visualKeywords = [
      'diagram', 'chart', 'graph', 'visual', 'picture', 'image', 'drawing',
      'sketch', 'illustration', 'figure', 'map', 'structure', 'process',
      'flowchart', 'timeline', 'anatomy', 'molecule', 'cell', 'organism',
      'geometry', 'trigonometry', 'physics', 'chemistry', 'biology'
    ];

    const lowerContent = content.toLowerCase();
    return visualKeywords.some(keyword => lowerContent.includes(keyword));
  }

  /**
   * Extract image generation prompts from content
   */
  private extractImagePrompts(content: string): ImageGenerationRequest[] {
    const prompts: ImageGenerationRequest[] = [];
    
    // Look for specific visual suggestions in the content
    const visualMatches = content.match(/(?:draw|sketch|diagram|illustrate|visualize)\s+([^.!?]+)/gi);
    
    if (visualMatches) {
      visualMatches.forEach(match => {
        const prompt = match.replace(/(?:draw|sketch|diagram|illustrate|visualize)\s+/i, '').trim();
        if (prompt.length > 10) {
          prompts.push({
            prompt: `Educational diagram: ${prompt}`,
            style: 'diagram'
          });
        }
      });
    }

    // If no specific prompts found, create one based on the topic
    if (prompts.length === 0) {
      const topic = this.extractTopic(content);
      if (topic) {
        prompts.push({
          prompt: `Educational illustration explaining ${topic}`,
          style: 'educational'
        });
      }
    }

    return prompts.slice(0, 2); // Limit to 2 images per response
  }

  /**
   * Extract the main topic from content
   */
  private extractTopic(content: string): string | null {
    // Simple topic extraction - in a real implementation, you might use NLP
    const sentences = content.split(/[.!?]/);
    const firstSentence = sentences[0]?.trim();
    
    if (firstSentence && firstSentence.length > 10) {
      return firstSentence;
    }
    
    return null;
  }

  /**
   * Build image generation prompt
   */
  private buildImagePrompt(request: ImageGenerationRequest): string {
    const { prompt, style = 'educational', size = 'medium' } = request;
    
    const styleModifiers = {
      educational: 'clear, informative, academic style',
      diagram: 'clean, technical diagram with labels',
      illustration: 'engaging, colorful illustration',
      photorealistic: 'high-quality, realistic photograph'
    };

    const sizeModifiers = {
      small: 'small, compact',
      medium: 'medium-sized, detailed',
      large: 'large, comprehensive'
    };

    return `${prompt}, ${styleModifiers[style]}, ${sizeModifiers[size]}, professional quality`;
  }

  /**
   * Extract learning suggestions from response
   */
  private extractSuggestions(content: string): string[] {
    const suggestions: string[] = [];
    
    // Look for suggestion patterns
    const suggestionPatterns = [
      /(?:try|consider|suggest|recommend|you could|it would be helpful)\s+([^.!?]+)/gi,
      /(?:practice|study|review|explore|investigate)\s+([^.!?]+)/gi
    ];

    suggestionPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const suggestion = match.replace(/(?:try|consider|suggest|recommend|you could|it would be helpful|practice|study|review|explore|investigate)\s+/i, '').trim();
          if (suggestion.length > 10 && suggestion.length < 100) {
            suggestions.push(suggestion);
          }
        });
      }
    });

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  /**
   * Get system prompt based on learning style
   */
  private getTutorSystemPrompt(learningStyle: string): string {
    const basePrompt = `You are an AI tutor designed to help students learn effectively. You should:
- Provide clear, accurate explanations
- Ask follow-up questions to check understanding
- Break down complex topics into manageable parts
- Use examples and analogies to illustrate concepts
- Encourage critical thinking and problem-solving
- Be patient and supportive while maintaining high standards
- When appropriate, suggest creating visual diagrams or sketches
- Adapt your teaching style to the student's learning preferences`;

    const stylePrompts = {
      visual: 'Focus on visual descriptions, diagrams, and visual analogies. Suggest drawing or sketching concepts. Use phrases like "imagine this visually" or "picture this as a diagram".',
      auditory: 'Use verbal explanations, storytelling, and encourage students to explain concepts out loud. Use phrases like "let me explain this step by step" or "try explaining this back to me".',
      kinesthetic: 'Suggest hands-on activities, experiments, and physical examples. Use movement and action-based learning. Use phrases like "try this experiment" or "let\'s work through this together".',
      reading: 'Provide detailed written explanations, suggest reading materials, and use text-based examples. Use phrases like "let\'s break this down in writing" or "here\'s a detailed explanation".',
      mixed: 'Use a combination of visual, auditory, and kinesthetic approaches based on the topic. Adapt your style to what works best for each concept.'
    };

    const stylePrompt = stylePrompts[learningStyle as keyof typeof stylePrompts] || stylePrompts.mixed;
    
    return `${basePrompt}\n\n${stylePrompt}`;
  }

  /**
   * Generate a fallback response when AI is unavailable
   */
  generateFallbackResponse(userMessage: string): TutorResponse {
    const fallbackMessages = [
      "I'm currently experiencing some technical difficulties, but I'm here to help! Please wait a moment and try again. In the meantime, you might want to review your notes or try a different approach to the problem.",
      "Our AI tutors are taking a quick break, but they'll be back shortly! Please wait a moment and try your question again. I'm working hard to get back to helping you learn.",
      "I'm temporarily unavailable, but don't worry - I'll be back soon! Please wait a moment and try again. Your learning journey is important to me.",
      "Technical hiccup detected! Our AI systems are working to get back online. Please wait a moment and try again. I'm committed to helping you succeed."
    ];

    const randomMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];

    return {
      content: randomMessage,
      provider: 'fallback',
      model: 'fallback',
      timestamp: new Date().toISOString(),
      suggestions: [
        'Try rephrasing your question',
        'Check your internet connection',
        'Wait a moment and try again',
        'Consider breaking down your question into smaller parts'
      ]
    };
  }
}

// Create singleton instance
export const tutorAIService = new TutorAIService();
