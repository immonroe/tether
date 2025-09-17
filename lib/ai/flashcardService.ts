import { AIProvider, ChatMessage, AIResponse, AIOptions } from './types';
import { Flashcard } from '../types';
import { aiService } from './service';
import { GeminiProvider } from './providers/gemini';

export interface FlashcardSuggestion {
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  explanation?: string;
}

export interface TopicAnalysis {
  mainTopics: string[];
  subtopics: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  suggestedCardCount: number;
  learningObjectives: string[];
}

export interface FlashcardGenerationOptions {
  topic: string;
  count?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
  includeExamples?: boolean;
  includeDefinitions?: boolean;
  includeFormulas?: boolean;
}

export class FlashcardAIService {
  private aiService = aiService;
  private geminiProvider: GeminiProvider | null = null;

  constructor() {
    // Initialize Gemini provider if available
    if (process.env.GEMINI_API_KEY) {
      this.geminiProvider = new GeminiProvider(process.env.GEMINI_API_KEY);
    }
  }

  /**
   * Analyze a topic and suggest flashcard content
   */
  async analyzeTopic(topic: string): Promise<TopicAnalysis> {
    // Use Gemini's structured output if available
    if (this.geminiProvider) {
      try {
        const schema = {
          type: "object",
          properties: {
            mainTopics: {
              type: "array",
              items: { type: "string" },
              description: "3-5 key areas of the topic"
            },
            subtopics: {
              type: "array",
              items: { type: "string" },
              description: "Specific concepts within each main topic"
            },
            difficulty: {
              type: "string",
              enum: ["beginner", "intermediate", "advanced"],
              description: "Overall difficulty level of the topic"
            },
            suggestedCardCount: {
              type: "number",
              minimum: 5,
              maximum: 20,
              description: "Recommended number of flashcards to create"
            },
            learningObjectives: {
              type: "array",
              items: { type: "string" },
              description: "What students should achieve by studying this topic"
            }
          },
          required: ["mainTopics", "subtopics", "difficulty", "suggestedCardCount", "learningObjectives"]
        };

        const analysis = await this.geminiProvider.generateStructuredOutput(
          [{ role: 'user', content: `Analyze the topic "${topic}" for flashcard creation. Provide a comprehensive analysis of the main topics, subtopics, difficulty level, suggested number of flashcards, and learning objectives.` }],
          schema,
          {
            temperature: 0.3,
            systemPrompt: 'You are an educational content expert specializing in creating effective learning materials. Analyze topics thoroughly and provide structured, actionable insights for flashcard creation.'
          }
        );

        return analysis as TopicAnalysis;
      } catch (error) {
        console.error('Gemini structured output failed, falling back to regular generation:', error);
      }
    }

    // Fallback to regular AI service
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: `Analyze the topic "${topic}" for flashcard creation. Provide:
1. Main topics (3-5 key areas)
2. Subtopics (specific concepts within each main topic)
3. Difficulty level (beginner/intermediate/advanced)
4. Suggested number of flashcards (5-20)
5. Learning objectives (what students should achieve)

Format as JSON with the structure:
{
  "mainTopics": ["topic1", "topic2", "topic3"],
  "subtopics": ["subtopic1", "subtopic2", "subtopic3"],
  "difficulty": "beginner|intermediate|advanced",
  "suggestedCardCount": 10,
  "learningObjectives": ["objective1", "objective2", "objective3"]
}`
      }
    ];

    try {
      const response = await this.aiService.generateResponse(messages, {
        temperature: 0.3,
        maxTokens: 1000,
        systemPrompt: 'You are an educational content expert specializing in creating effective learning materials. Analyze topics thoroughly and provide structured, actionable insights for flashcard creation.'
      });

      // Parse the JSON response
      const analysis = JSON.parse(response.content);
      return analysis as TopicAnalysis;
    } catch (error) {
      console.error('Error analyzing topic:', error);
      // Return fallback analysis
      return this.getFallbackTopicAnalysis(topic);
    }
  }

  /**
   * Generate flashcards for a specific topic
   */
  async generateFlashcards(options: FlashcardGenerationOptions): Promise<FlashcardSuggestion[]> {
    const { topic, count = 10, difficulty, learningStyle, includeExamples, includeDefinitions, includeFormulas } = options;

    // Use Gemini's structured output if available
    if (this.geminiProvider) {
      try {
        const schema = {
          type: "array",
          items: {
            type: "object",
            properties: {
              front: {
                type: "string",
                description: "Question or term for the front of the flashcard"
              },
              back: {
                type: "string",
                description: "Answer or definition for the back of the flashcard"
              },
              difficulty: {
                type: "string",
                enum: ["easy", "medium", "hard"],
                description: "Difficulty level of the flashcard"
              },
              tags: {
                type: "array",
                items: { type: "string" },
                description: "Tags to categorize the flashcard"
              },
              explanation: {
                type: "string",
                description: "Optional detailed explanation or additional context"
              }
            },
            required: ["front", "back", "difficulty", "tags"]
          }
        };

        const flashcards = await this.geminiProvider.generateStructuredOutput(
          [{ 
            role: 'user', 
            content: `Generate ${count} flashcards for the topic "${topic}". 

Requirements:
- Difficulty: ${difficulty || 'medium'}
- Learning style: ${learningStyle || 'mixed'}
- Include examples: ${includeExamples ? 'yes' : 'no'}
- Include definitions: ${includeDefinitions ? 'yes' : 'no'}
- Include formulas: ${includeFormulas ? 'yes' : 'no'}

Create clear, concise, and pedagogically sound flashcards that promote active recall and spaced repetition learning.` 
          }],
          schema,
          {
            temperature: 0.7,
            learningStyle,
            systemPrompt: 'You are an expert educational content creator specializing in creating effective flashcards. Create clear, concise, and pedagogically sound flashcards that promote active recall and spaced repetition learning.'
          }
        );

        return Array.isArray(flashcards) ? flashcards : [];
      } catch (error) {
        console.error('Gemini structured output failed, falling back to regular generation:', error);
      }
    }

    // Fallback to regular AI service
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: `Generate ${count} flashcards for the topic "${topic}". 

Requirements:
- Difficulty: ${difficulty || 'medium'}
- Learning style: ${learningStyle || 'mixed'}
- Include examples: ${includeExamples ? 'yes' : 'no'}
- Include definitions: ${includeDefinitions ? 'yes' : 'no'}
- Include formulas: ${includeFormulas ? 'yes' : 'no'}

Format each flashcard as JSON:
{
  "front": "Question or term",
  "back": "Answer or definition",
  "difficulty": "easy|medium|hard",
  "tags": ["tag1", "tag2"],
  "explanation": "Optional detailed explanation"
}

Return as an array of flashcards.`
      }
    ];

    try {
      const response = await this.aiService.generateResponse(messages, {
        temperature: 0.7,
        maxTokens: 2000,
        learningStyle,
        systemPrompt: `You are an expert educational content creator specializing in creating effective flashcards. Create clear, concise, and pedagogically sound flashcards that promote active recall and spaced repetition learning.`
      });

      // Parse the JSON response
      const flashcards = JSON.parse(response.content);
      return Array.isArray(flashcards) ? flashcards : [];
    } catch (error) {
      console.error('Error generating flashcards:', error);
      // Return fallback flashcards
      return this.getFallbackFlashcards(topic, count, difficulty);
    }
  }

  /**
   * Generate flashcards from uploaded content (PDF, text, etc.)
   */
  async generateFromContent(content: string, options: Partial<FlashcardGenerationOptions> = {}): Promise<FlashcardSuggestion[]> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: `Extract key learning points from this content and create flashcards:

${content}

Create flashcards that capture the most important concepts, definitions, and facts. Focus on information that would be useful for spaced repetition learning.

Format as JSON array:
[{
  "front": "Question or term",
  "back": "Answer or definition", 
  "difficulty": "easy|medium|hard",
  "tags": ["tag1", "tag2"],
  "explanation": "Optional detailed explanation"
}]`
      }
    ];

    try {
      const response = await this.aiService.generateResponse(messages, {
        temperature: 0.5,
        maxTokens: 2000,
        systemPrompt: 'You are an expert at extracting key learning points from educational content and converting them into effective flashcards for spaced repetition learning.'
      });

      const flashcards = JSON.parse(response.content);
      return Array.isArray(flashcards) ? flashcards : [];
    } catch (error) {
      console.error('Error generating flashcards from content:', error);
      return this.getFallbackFlashcards('General Content', 5, 'medium');
    }
  }

  /**
   * Improve existing flashcards with AI suggestions
   */
  async improveFlashcard(flashcard: Flashcard): Promise<FlashcardSuggestion> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: `Improve this flashcard for better learning effectiveness:

Front: "${flashcard.front}"
Back: "${flashcard.back}"
Current difficulty: ${flashcard.difficulty}

Suggest improvements for:
- Clarity and conciseness
- Better question formulation
- More comprehensive answer
- Appropriate difficulty level
- Learning effectiveness

Format as JSON:
{
  "front": "Improved question",
  "back": "Improved answer",
  "difficulty": "easy|medium|hard",
  "tags": ["tag1", "tag2"],
  "explanation": "Why these changes improve learning"
}`
      }
    ];

    try {
      const response = await this.aiService.generateResponse(messages, {
        temperature: 0.6,
        maxTokens: 1000,
        systemPrompt: 'You are an expert in educational psychology and flashcard design. Focus on improving learning effectiveness through better question design, clearer answers, and appropriate difficulty levels.'
      });

      const improved = JSON.parse(response.content);
      return improved as FlashcardSuggestion;
    } catch (error) {
      console.error('Error improving flashcard:', error);
      return {
        front: flashcard.front,
        back: flashcard.back,
        difficulty: flashcard.difficulty,
        tags: [],
        explanation: 'Unable to generate improvements at this time.'
      };
    }
  }

  /**
   * Generate study tips and strategies for a topic
   */
  async generateStudyTips(topic: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<string[]> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: `Generate 5-7 study tips and strategies for learning "${topic}" at ${difficulty} level. Focus on practical, actionable advice for effective learning and retention.`
      }
    ];

    try {
      const response = await this.aiService.generateResponse(messages, {
        temperature: 0.7,
        maxTokens: 800,
        systemPrompt: 'You are a learning specialist with expertise in study strategies and memory techniques. Provide practical, evidence-based study tips.'
      });

      // Extract tips from the response (assuming they're in a list format)
      const tips = response.content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
        .filter(tip => tip.length > 10);

      return tips.length > 0 ? tips : this.getFallbackStudyTips(topic);
    } catch (error) {
      console.error('Error generating study tips:', error);
      return this.getFallbackStudyTips(topic);
    }
  }

  // Fallback methods for when AI providers are unavailable
  private getFallbackTopicAnalysis(topic: string): TopicAnalysis {
    const commonTopics = {
      'math': {
        mainTopics: ['Algebra', 'Geometry', 'Calculus', 'Statistics'],
        subtopics: ['Equations', 'Functions', 'Graphs', 'Probability'],
        difficulty: 'intermediate' as const,
        suggestedCardCount: 15,
        learningObjectives: ['Solve equations', 'Understand functions', 'Apply formulas']
      },
      'science': {
        mainTopics: ['Physics', 'Chemistry', 'Biology', 'Earth Science'],
        subtopics: ['Laws of Motion', 'Chemical Reactions', 'Cell Biology', 'Weather'],
        difficulty: 'intermediate' as const,
        suggestedCardCount: 12,
        learningObjectives: ['Understand scientific principles', 'Apply scientific methods', 'Analyze data']
      },
      'history': {
        mainTopics: ['Ancient History', 'Medieval Period', 'Modern History', 'World Wars'],
        subtopics: ['Key Events', 'Important Figures', 'Causes and Effects', 'Timeline'],
        difficulty: 'intermediate' as const,
        suggestedCardCount: 10,
        learningObjectives: ['Understand historical context', 'Identify key events', 'Analyze causes and effects']
      }
    };

    const lowerTopic = topic.toLowerCase();
    for (const [key, analysis] of Object.entries(commonTopics)) {
      if (lowerTopic.includes(key)) {
        return analysis;
      }
    }

    return {
      mainTopics: [topic],
      subtopics: ['Basic Concepts', 'Key Terms', 'Important Facts'],
      difficulty: 'intermediate',
      suggestedCardCount: 8,
      learningObjectives: ['Understand basic concepts', 'Learn key terminology', 'Apply knowledge']
    };
  }

  private getFallbackFlashcards(topic: string, count: number, difficulty?: string): FlashcardSuggestion[] {
    const flashcards: FlashcardSuggestion[] = [];
    const baseCards = this.getBaseFlashcards(topic);

    for (let i = 0; i < Math.min(count, baseCards.length); i++) {
      const card = baseCards[i];
      flashcards.push({
        front: card.front,
        back: card.back,
        difficulty: (difficulty as 'easy' | 'medium' | 'hard') || 'medium',
        tags: [topic.toLowerCase()],
        explanation: card.explanation
      });
    }

    return flashcards;
  }

  private getBaseFlashcards(topic: string): Array<{front: string, back: string, explanation?: string}> {
    const lowerTopic = topic.toLowerCase();
    
    if (lowerTopic.includes('math') || lowerTopic.includes('algebra')) {
      return [
        { front: 'What is the quadratic formula?', back: 'x = (-b ± √(b² - 4ac)) / 2a', explanation: 'Used to solve quadratic equations of the form ax² + bx + c = 0' },
        { front: 'What is the slope-intercept form of a line?', back: 'y = mx + b', explanation: 'Where m is the slope and b is the y-intercept' },
        { front: 'What is the Pythagorean theorem?', back: 'a² + b² = c²', explanation: 'In a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides' }
      ];
    }
    
    if (lowerTopic.includes('science') || lowerTopic.includes('physics')) {
      return [
        { front: 'What is Newton\'s First Law?', back: 'An object at rest stays at rest, an object in motion stays in motion', explanation: 'Unless acted upon by an external force' },
        { front: 'What is the formula for kinetic energy?', back: 'KE = ½mv²', explanation: 'Where m is mass and v is velocity' },
        { front: 'What is the speed of light?', back: '299,792,458 m/s', explanation: 'Approximately 3 × 10⁸ m/s in a vacuum' }
      ];
    }
    
    if (lowerTopic.includes('history')) {
      return [
        { front: 'When did World War II end?', back: '1945', explanation: 'The war ended with the surrender of Japan on September 2, 1945' },
        { front: 'Who was the first President of the United States?', back: 'George Washington', explanation: 'Served from 1789 to 1797' },
        { front: 'What year did the Berlin Wall fall?', back: '1989', explanation: 'Marked the beginning of the end of the Cold War' }
      ];
    }

    // Generic flashcards
    return [
      { front: `What is the main concept of ${topic}?`, back: `The fundamental principle that defines ${topic}`, explanation: 'This is a basic understanding question' },
      { front: `Name three key aspects of ${topic}`, back: 'Aspect 1, Aspect 2, Aspect 3', explanation: 'These are the main components to understand' },
      { front: `Why is ${topic} important?`, back: 'It provides essential knowledge and skills', explanation: 'Understanding the importance helps with motivation' }
    ];
  }

  private getFallbackStudyTips(topic: string): string[] {
    return [
      `Create a study schedule for ${topic} with regular review sessions`,
      'Use active recall techniques - test yourself without looking at notes',
      'Break down complex concepts into smaller, manageable parts',
      'Create visual aids like diagrams or mind maps',
      'Practice explaining concepts out loud to reinforce understanding',
      'Use spaced repetition to review material at increasing intervals',
      'Connect new information to what you already know'
    ];
  }
}

// Create singleton instance
export const flashcardAIService = new FlashcardAIService();
