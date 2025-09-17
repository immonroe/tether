'use client';

import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Lightbulb, Target } from 'lucide-react';
import { LearningStyle, LearningStyleAnalysis } from '@/lib/ai/types';
import { learningStyleDetector } from '@/lib/ai/learningStyleDetector';

interface LearningStyleInsightsProps {
  userId: string;
  onStyleChange?: (style: LearningStyle) => void;
}

export const LearningStyleInsights: React.FC<LearningStyleInsightsProps> = ({
  userId,
  onStyleChange
}) => {
  const [analysis, setAnalysis] = useState<LearningStyleAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const styleEmojis: Record<LearningStyle, string> = {
    visual: '👁️',
    auditory: '👂',
    kinesthetic: '✋',
    reading: '📖',
    mixed: '🔄'
  };

  const styleNames: Record<LearningStyle, string> = {
    visual: 'Visual',
    auditory: 'Auditory',
    kinesthetic: 'Kinesthetic',
    reading: 'Reading/Writing',
    mixed: 'Mixed'
  };

  const styleDescriptions: Record<LearningStyle, string> = {
    visual: 'You learn best through images, diagrams, and visual representations.',
    auditory: 'You learn best through listening, discussion, and verbal explanations.',
    kinesthetic: 'You learn best through hands-on activities and physical experiences.',
    reading: 'You learn best through reading, writing, and text-based materials.',
    mixed: 'You learn best using a combination of different learning approaches.'
  };

  const analyzeLearningStyle = async () => {
    setIsLoading(true);
    try {
      // This would typically fetch recent chat messages from the database
      // For now, we'll simulate the analysis
      const mockMessages = [
        { role: 'user' as const, content: 'Can you show me how this works?', timestamp: new Date().toISOString() },
        { role: 'assistant' as const, content: 'I can explain this concept...', timestamp: new Date().toISOString() },
        { role: 'user' as const, content: 'I need to see a diagram to understand', timestamp: new Date().toISOString() }
      ];
      
      const result = learningStyleDetector.analyzeLearningStyle(mockMessages);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing learning style:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    analyzeLearningStyle();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-blue-600 animate-pulse" />
          <span className="text-sm text-blue-700">Analyzing your learning style...</span>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const confidencePercentage = Math.round(analysis.confidence * 100);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Learning Style Insights</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      <div className="space-y-3">
        {/* Detected Style */}
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{styleEmojis[analysis.detectedStyle]}</span>
          <div>
            <div className="font-medium text-gray-900">
              {styleNames[analysis.detectedStyle]} Learner
            </div>
            <div className="text-sm text-gray-600">
              {styleDescriptions[analysis.detectedStyle]}
            </div>
          </div>
        </div>

        {/* Confidence Level */}
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-sm text-gray-700">
            Confidence: {confidencePercentage}%
          </span>
        </div>

        {/* Reasoning */}
        <div className="text-sm text-gray-600">
          {analysis.reasoning}
        </div>

        {/* Detailed View */}
        {showDetails && (
          <div className="space-y-3 pt-3 border-t border-blue-200">
            {/* Suggestions */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-gray-900">Learning Suggestions</span>
              </div>
              <ul className="space-y-1">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Style Change Option */}
            {onStyleChange && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-gray-900">Change Learning Style</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(styleNames).map(([style, name]) => (
                    <button
                      key={style}
                      onClick={() => onStyleChange(style as LearningStyle)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        analysis.detectedStyle === style
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {styleEmojis[style as LearningStyle]} {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
