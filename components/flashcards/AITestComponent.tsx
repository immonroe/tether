'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { flashcardAIService } from '@/lib/ai/flashcardService';
import { aiService } from '@/lib/ai/service';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export const AITestComponent: React.FC = () => {
  const [topic, setTopic] = useState('photosynthesis');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);

  const testAIService = async () => {
    setIsLoading(true);
    setError('');
    setResult('');

    try {
      // Test basic AI service
      const response = await aiService.generateResponse([
        { role: 'user', content: `Explain ${topic} in simple terms` }
      ]);

      setResult(`AI Response (${response.provider}): ${response.content}`);
      setAvailableProviders(aiService.getAvailableProviders());
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testFlashcardGeneration = async () => {
    setIsLoading(true);
    setError('');
    setResult('');

    try {
      // Test flashcard generation
      const flashcards = await flashcardAIService.generateFlashcards({
        topic,
        count: 3,
        difficulty: 'medium'
      });

      setResult(`Generated ${flashcards.length} flashcards:\n\n${flashcards.map((card, i) => 
        `${i + 1}. Front: ${card.front}\n   Back: ${card.back}\n   Difficulty: ${card.difficulty}`
      ).join('\n\n')}`);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testTopicAnalysis = async () => {
    setIsLoading(true);
    setError('');
    setResult('');

    try {
      // Test topic analysis
      const analysis = await flashcardAIService.analyzeTopic(topic);

      setResult(`Topic Analysis for "${topic}":
Main Topics: ${analysis.mainTopics.join(', ')}
Subtopics: ${analysis.subtopics.join(', ')}
Difficulty: ${analysis.difficulty}
Suggested Cards: ${analysis.suggestedCardCount}
Learning Objectives: ${analysis.learningObjectives.join(', ')}`);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-900">AI Service Test</h2>
      
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Topic
            </label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic to test"
              className="w-full"
            />
          </div>

          <div className="flex space-x-4">
            <Button onClick={testAIService} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Test Basic AI
            </Button>
            <Button onClick={testFlashcardGeneration} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Test Flashcard Gen
            </Button>
            <Button onClick={testTopicAnalysis} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Test Topic Analysis
            </Button>
          </div>

          {availableProviders.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Available AI Providers:</h4>
              <div className="flex flex-wrap gap-2">
                {availableProviders.map(provider => (
                  <span key={provider} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    {provider}
                  </span>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {result && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Result:</h4>
              <pre className="text-sm text-blue-800 whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
