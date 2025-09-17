import { AIProvider, ChatMessage, AIResponse, AIOptions } from '../types';

export class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://api.anthropic.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }]
        }),
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
      model = 'claude-3-haiku-20240307',
      systemPrompt,
      learningStyle
    } = options;

    const systemMessage = systemPrompt || this.getDefaultSystemPrompt(learningStyle);
    
    // Convert messages to Anthropic format
    const anthropicMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature,
          system: systemMessage,
          messages: anthropicMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.content[0].text,
        usage: {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        },
        model: data.model,
        provider: this.name,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Anthropic request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
