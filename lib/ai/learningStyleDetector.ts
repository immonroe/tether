import { LearningStyle, ChatMessage, LearningStyleAnalysis, ChatSession } from './types';

export interface LearningPatterns {
  visual: string[];
  auditory: string[];
  kinesthetic: string[];
  reading: string[];
  mixed: string[];
}

export class LearningStyleDetector {
  private patterns: LearningPatterns = {
    visual: [
      'see', 'show', 'draw', 'diagram', 'picture', 'visual', 'chart', 'graph',
      'look', 'watch', 'observe', 'illustrate', 'sketch', 'design', 'color',
      'bright', 'dark', 'shapes', 'patterns', 'images', 'photos', 'videos'
    ],
    auditory: [
      'hear', 'listen', 'sound', 'speak', 'talk', 'explain out loud', 'voice',
      'music', 'rhythm', 'tone', 'pronounce', 'discuss', 'debate', 'conversation',
      'audio', 'podcast', 'lecture', 'speech', 'sing', 'hum', 'whisper'
    ],
    kinesthetic: [
      'hands-on', 'practice', 'do', 'try', 'experiment', 'build', 'create',
      'touch', 'feel', 'move', 'walk', 'run', 'dance', 'exercise', 'play',
      'manipulate', 'construct', 'assemble', 'disassemble', 'act out', 'role play',
      'simulate', 'model', 'craft', 'make', 'fix', 'repair'
    ],
    reading: [
      'read', 'text', 'book', 'article', 'written', 'notes', 'study', 'words',
      'paragraph', 'sentence', 'chapter', 'page', 'document', 'paper', 'essay',
      'literature', 'novel', 'story', 'poem', 'script', 'manual', 'guide'
    ],
    mixed: [
      'learn', 'understand', 'comprehend', 'study', 'explore', 'discover',
      'analyze', 'synthesize', 'evaluate', 'compare', 'contrast', 'organize'
    ]
  };

  private responseFormats: Record<LearningStyle, {
    greeting: string;
    explanation: string;
    examples: string;
    questions: string;
    encouragement: string;
  }> = {
    visual: {
      greeting: "I'll help you visualize this concept! 🎨",
      explanation: "Let me paint a picture of this for you...",
      examples: "Here's a visual example:",
      questions: "Can you picture how this works?",
      encouragement: "Great visual thinking! Try sketching this out."
    },
    auditory: {
      greeting: "Let's talk through this together! 🎵",
      explanation: "Let me explain this step by step...",
      examples: "Here's how this sounds in practice:",
      questions: "Does this explanation make sense when you say it out loud?",
      encouragement: "Excellent! Try explaining this concept to someone else."
    },
    kinesthetic: {
      greeting: "Let's get hands-on with this! ✋",
      explanation: "Let's break this down into actionable steps...",
      examples: "Here's something you can try right now:",
      questions: "Can you try this out and see what happens?",
      encouragement: "Perfect! Keep experimenting and learning by doing."
    },
    reading: {
      greeting: "Let's dive deep into the text! 📖",
      explanation: "Let me provide a detailed written explanation...",
      examples: "Here's a comprehensive example:",
      questions: "What do you think about this written explanation?",
      encouragement: "Great analytical thinking! Consider writing your own summary."
    },
    mixed: {
      greeting: "Let's explore this from multiple angles! 🔄",
      explanation: "I'll explain this using different approaches...",
      examples: "Here are several ways to understand this:",
      questions: "Which approach resonates most with you?",
      encouragement: "Excellent! You're using multiple learning strategies."
    }
  };

  // Analyze chat messages to detect learning style
  analyzeLearningStyle(messages: ChatMessage[]): LearningStyleAnalysis {
    const recentMessages = messages.slice(-10); // Analyze last 10 messages
    const content = recentMessages.map(m => m.content).join(' ').toLowerCase();
    
    const scores = this.calculateStyleScores(content);
    const detectedStyle = this.getHighestScoringStyle(scores);
    const confidence = this.calculateConfidence(scores, detectedStyle);
    const reasoning = this.generateReasoning(scores, detectedStyle);
    const suggestions = this.generateSuggestions(detectedStyle);

    return {
      detectedStyle,
      confidence,
      reasoning,
      suggestions
    };
  }

  // Calculate scores for each learning style
  private calculateStyleScores(content: string): Record<LearningStyle, number> {
    const scores: Record<LearningStyle, number> = {
      visual: 0,
      auditory: 0,
      kinesthetic: 0,
      reading: 0,
      mixed: 0
    };

    Object.entries(this.patterns).forEach(([style, keywords]) => {
      keywords.forEach((keyword: string) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = content.match(regex);
        if (matches) {
          scores[style as LearningStyle] += matches.length;
        }
      });
    });

    return scores;
  }

  // Get the highest scoring learning style
  private getHighestScoringStyle(scores: Record<LearningStyle, number>): LearningStyle {
    const maxScore = Math.max(...Object.values(scores));
    
    if (maxScore === 0) {
      return 'mixed'; // Default to mixed if no patterns detected
    }

    const highestStyle = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0];
    return (highestStyle as LearningStyle) || 'mixed';
  }

  // Calculate confidence level (0-1)
  private calculateConfidence(scores: Record<LearningStyle, number>, detectedStyle: LearningStyle): number {
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    
    if (totalScore === 0) return 0.5; // Medium confidence if no patterns

    const detectedScore = scores[detectedStyle];
    const confidence = detectedScore / totalScore;
    
    // Boost confidence if there's a clear winner
    const sortedScores = Object.values(scores).sort((a, b) => b - a);
    if (sortedScores[0] > sortedScores[1] * 2) {
      return Math.min(confidence * 1.5, 1);
    }

    return Math.min(confidence, 1);
  }

  // Generate reasoning for the detection
  private generateReasoning(scores: Record<LearningStyle, number>, detectedStyle: LearningStyle): string {
    const detectedScore = scores[detectedStyle];
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

    if (totalScore === 0) {
      return "No specific learning patterns detected, defaulting to mixed approach.";
    }

    const percentage = Math.round((detectedScore / totalScore) * 100);
    const styleName = this.getStyleDisplayName(detectedStyle);
    
    return `Detected ${styleName} learning style with ${percentage}% confidence based on language patterns in recent messages.`;
  }

  // Generate suggestions for the detected learning style
  private generateSuggestions(detectedStyle: LearningStyle): string[] {
    const suggestions: Record<LearningStyle, string[]> = {
      visual: [
        "Try drawing diagrams or mind maps",
        "Use color coding for different concepts",
        "Create visual flashcards with images",
        "Watch educational videos on this topic",
        "Use charts and graphs to organize information"
      ],
      auditory: [
        "Read explanations out loud",
        "Record yourself explaining concepts",
        "Listen to podcasts or lectures",
        "Discuss topics with study partners",
        "Use mnemonic devices with rhythm"
      ],
      kinesthetic: [
        "Build models or prototypes",
        "Use hands-on experiments",
        "Take frequent breaks to move around",
        "Use manipulatives or physical objects",
        "Practice with real-world applications"
      ],
      reading: [
        "Take detailed written notes",
        "Create comprehensive summaries",
        "Read multiple sources on the topic",
        "Write practice essays or reports",
        "Use text-based study guides"
      ],
      mixed: [
        "Combine multiple learning approaches",
        "Switch between different study methods",
        "Use a variety of resources",
        "Adapt your approach based on the topic",
        "Experiment with different techniques"
      ]
    };

    return suggestions[detectedStyle];
  }

  // Get display name for learning style
  private getStyleDisplayName(style: LearningStyle): string {
    const names: Record<LearningStyle, string> = {
      visual: "Visual",
      auditory: "Auditory", 
      kinesthetic: "Kinesthetic",
      reading: "Reading/Writing",
      mixed: "Mixed"
    };
    return names[style];
  }

  // Format response based on learning style
  formatResponse(content: string, learningStyle: LearningStyle): string {
    const format = this.responseFormats[learningStyle];
    
    // Add style-specific formatting to the response
    let formattedContent = content;
    
    // Add visual cues for visual learners
    if (learningStyle === 'visual') {
      formattedContent = this.addVisualCues(formattedContent);
    }
    
    // Add auditory cues for auditory learners
    if (learningStyle === 'auditory') {
      formattedContent = this.addAuditoryCues(formattedContent);
    }
    
    // Add kinesthetic cues for kinesthetic learners
    if (learningStyle === 'kinesthetic') {
      formattedContent = this.addKinestheticCues(formattedContent);
    }
    
    // Add reading cues for reading learners
    if (learningStyle === 'reading') {
      formattedContent = this.addReadingCues(formattedContent);
    }

    return formattedContent;
  }

  // Add visual formatting cues
  private addVisualCues(content: string): string {
    // Add emojis and visual indicators
    return content
      .replace(/\b(see|look|watch|observe)\b/gi, '👀 $1')
      .replace(/\b(draw|sketch|design)\b/gi, '🎨 $1')
      .replace(/\b(chart|graph|diagram)\b/gi, '📊 $1')
      .replace(/\b(picture|image|photo)\b/gi, '🖼️ $1');
  }

  // Add auditory formatting cues
  private addAuditoryCues(content: string): string {
    return content
      .replace(/\b(hear|listen)\b/gi, '👂 $1')
      .replace(/\b(speak|talk|discuss)\b/gi, '🗣️ $1')
      .replace(/\b(music|rhythm|tone)\b/gi, '🎵 $1')
      .replace(/\b(explain|describe)\b/gi, '💬 $1');
  }

  // Add kinesthetic formatting cues
  private addKinestheticCues(content: string): string {
    return content
      .replace(/\b(try|practice|do)\b/gi, '✋ $1')
      .replace(/\b(build|create|make)\b/gi, '🔨 $1')
      .replace(/\b(experiment|test)\b/gi, '🧪 $1')
      .replace(/\b(move|walk|run)\b/gi, '🏃 $1');
  }

  // Add reading formatting cues
  private addReadingCues(content: string): string {
    return content
      .replace(/\b(read|study|analyze)\b/gi, '📖 $1')
      .replace(/\b(write|note|document)\b/gi, '✍️ $1')
      .replace(/\b(summarize|outline)\b/gi, '📝 $1')
      .replace(/\b(comprehend|understand)\b/gi, '🧠 $1');
  }

  // Get learning style statistics from multiple sessions
  getLearningStyleStats(sessions: ChatSession[]): {
    mostCommonStyle: LearningStyle;
    styleDistribution: Record<LearningStyle, number>;
    totalSessions: number;
  } {
    const styleCounts: Record<LearningStyle, number> = {
      visual: 0,
      auditory: 0,
      kinesthetic: 0,
      reading: 0,
      mixed: 0
    };

    sessions.forEach(session => {
      if (session.learningStyle) {
        styleCounts[session.learningStyle]++;
      }
    });

    const mostCommonStyle = Object.entries(styleCounts).reduce((a, b) => 
      styleCounts[a[0] as LearningStyle] > styleCounts[b[0] as LearningStyle] ? a : b
    )[0] as LearningStyle;

    return {
      mostCommonStyle,
      styleDistribution: styleCounts,
      totalSessions: sessions.length
    };
  }
}

// Create singleton instance
export const learningStyleDetector = new LearningStyleDetector();
