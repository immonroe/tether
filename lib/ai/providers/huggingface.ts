import { AIProvider, ChatMessage, AIResponse, AIOptions } from '../types';

export class HuggingFaceProvider implements AIProvider {
  name = 'huggingface';
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey: string, baseUrl: string = 'https://api-inference.huggingface.co/models', model: string = 'microsoft/DialoGPT-medium') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'test',
          parameters: {
            max_length: 10,
            return_full_text: false
          }
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
      model = this.model,
      systemPrompt,
      learningStyle
    } = options;

    // Convert messages to a single prompt for Hugging Face
    const prompt = this.formatMessagesForHuggingFace(messages, systemPrompt, learningStyle);

    try {
      const response = await fetch(`${this.baseUrl}/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: maxTokens,
            temperature: temperature,
            do_sample: true,
            return_full_text: false,
            pad_token_id: 50256
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle different response formats from Hugging Face
      let content = '';
      if (Array.isArray(data) && data.length > 0) {
        content = data[0].generated_text || data[0].text || '';
      } else if (data.generated_text) {
        content = data.generated_text;
      } else if (data.text) {
        content = data.text;
      } else {
        content = 'I apologize, but I was unable to generate a proper response. Please try again.';
      }

      // Clean up the response
      content = this.cleanResponse(content, prompt);

      return {
        content,
        usage: {
          promptTokens: prompt.length / 4, // Rough estimate
          completionTokens: content.length / 4,
          totalTokens: (prompt.length + content.length) / 4,
        },
        model: model,
        provider: this.name,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Hugging Face request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatMessagesForHuggingFace(messages: ChatMessage[], systemPrompt?: string, learningStyle?: string): string {
    let prompt = '';
    
    if (systemPrompt) {
      prompt += `System: ${systemPrompt}\n\n`;
    }

    // Add learning style context
    if (learningStyle) {
      const styleContext = this.getLearningStyleContext(learningStyle);
      prompt += `Context: ${styleContext}\n\n`;
    }

    // Format conversation
    for (const message of messages) {
      if (message.role === 'user') {
        prompt += `Human: ${message.content}\n`;
      } else if (message.role === 'assistant') {
        prompt += `Assistant: ${message.content}\n`;
      } else if (message.role === 'system') {
        prompt += `System: ${message.content}\n`;
      }
    }

    prompt += 'Assistant: ';
    return prompt;
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

  private cleanResponse(content: string, originalPrompt: string): string {
    // Remove the original prompt if it appears in the response
    if (content.includes(originalPrompt)) {
      content = content.replace(originalPrompt, '').trim();
    }

    // Remove common artifacts
    content = content
      .replace(/^Assistant:\s*/g, '')
      .replace(/^Human:\s*/g, '')
      .replace(/^System:\s*/g, '')
      .replace(/\n\n+/g, '\n\n')
      .trim();

    // Ensure the response doesn't end abruptly
    if (content.length > 0 && !content.endsWith('.') && !content.endsWith('!') && !content.endsWith('?')) {
      content += '.';
    }

    return content || 'I apologize, but I was unable to generate a proper response. Please try again.';
  }
}
