'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Wand2, Loader2, CheckCircle, AlertCircle, Brain, FileText, Upload, Zap, Star, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Flashcard, FlashcardSuggestion, TopicAnalysis } from '@/lib/ai/flashcardService';
import { flashcardAIService } from '@/lib/ai/flashcardService';
import { GeminiProvider, GeminiModel } from '@/lib/ai/providers/gemini';

interface GeminiFlashcardCreatorProps {
  onSave: (flashcards: Flashcard[]) => void;
  onCancel: () => void;
  initialTopic?: string;
}

export const GeminiFlashcardCreator: React.FC<GeminiFlashcardCreatorProps> = ({
  onSave,
  onCancel,
  initialTopic = ''
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [flashcards, setFlashcards] = useState<FlashcardSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<TopicAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [availableModels, setAvailableModels] = useState<GeminiModel[]>([]);
  const [generationOptions, setGenerationOptions] = useState({
    count: 10,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    learningStyle: 'mixed' as 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed',
    includeExamples: true,
    includeDefinitions: true,
    includeFormulas: true
  });
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState<'topic' | 'content'>('topic');

  // Initialize available models
  useEffect(() => {
    const geminiProvider = new GeminiProvider(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
    setAvailableModels(geminiProvider.getAvailableModels());
  }, []);

  // Analyze topic when it changes
  useEffect(() => {
    if (topic.trim() && topic.length > 3) {
      analyzeTopic();
    }
  }, [topic]);

  const analyzeTopic = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const analysis = await flashcardAIService.analyzeTopic(topic);
      setAnalysis(analysis);
    } catch (err) {
      setError('Failed to analyze topic. Using fallback analysis.');
      console.error('Topic analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateFlashcards = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      let suggestions: FlashcardSuggestion[] = [];
      
      if (activeTab === 'topic') {
        suggestions = await flashcardAIService.generateFlashcards({
          topic,
          ...generationOptions
        });
      } else {
        suggestions = await flashcardAIService.generateFromContent(content, generationOptions);
      }
      
      setFlashcards(suggestions);
    } catch (err) {
      setError('Failed to generate flashcards. Please try again.');
      console.error('Flashcard generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateFlashcard = (index: number, field: keyof FlashcardSuggestion, value: string) => {
    const updated = [...flashcards];
    updated[index] = { ...updated[index], [field]: value };
    setFlashcards(updated);
  };

  const removeFlashcard = (index: number) => {
    setFlashcards(flashcards.filter((_, i) => i !== index));
  };

  const addEmptyFlashcard = () => {
    setFlashcards([...flashcards, {
      front: '',
      back: '',
      difficulty: 'medium',
      tags: [],
      explanation: ''
    }]);
  };

  const handleSave = () => {
    const validFlashcards = flashcards
      .filter(card => card.front.trim() && card.back.trim())
      .map(card => ({
        id: Math.random().toString(36).substr(2, 9),
        front: card.front,
        back: card.back,
        difficulty: card.difficulty,
        nextReview: new Date().toISOString(),
        streak: 0,
        deckId: 'default',
        createdAt: new Date(),
        updatedAt: new Date()
      }));

    onSave(validFlashcards);
  };

  const getModelIcon = (modelName: string) => {
    if (modelName.includes('pro')) return <Star className="w-4 h-4" />;
    if (modelName.includes('flash-lite')) return <Zap className="w-4 h-4" />;
    if (modelName.includes('image')) return <Upload className="w-4 h-4" />;
    return <Rocket className="w-4 h-4" />;
  };

  const getModelColor = (modelName: string) => {
    if (modelName.includes('pro')) return 'bg-purple-100 text-purple-800';
    if (modelName.includes('flash-lite')) return 'bg-green-100 text-green-800';
    if (modelName.includes('image')) return 'bg-pink-100 text-pink-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Brain className="w-6 h-6 mr-2 text-blue-600" />
            AI-Powered Flashcard Creator
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Powered by Google Gemini - Free, no credit card required
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={flashcards.length === 0}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Save Flashcards
          </Button>
        </div>
      </div>

      {/* Model Selection */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Gemini Model Selection</h3>
            <p className="text-sm text-gray-600">Choose the best model for your needs</p>
          </div>
          <Select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-64"
          >
            {availableModels.map((model) => (
              <option key={model.name} value={model.name}>
                {model.displayName}
              </option>
            ))}
          </Select>
        </div>
        
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {availableModels.map((model) => (
            <div
              key={model.name}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedModel === model.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedModel(model.name)}
            >
              <div className="flex items-center space-x-2 mb-2">
                {getModelIcon(model.name)}
                <span className="font-medium text-sm">{model.displayName}</span>
              </div>
              <p className="text-xs text-gray-600 mb-2">{model.description}</p>
              <div className="flex items-center justify-between">
                <Badge className={`text-xs ${getModelColor(model.name)}`}>
                  {model.useCase}
                </Badge>
                <span className="text-xs text-gray-500">{model.maxTokens} tokens</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('topic')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'topic'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Brain className="w-4 h-4 inline mr-2" />
          Topic-based
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'content'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          From Content
        </button>
      </div>

      {/* Input Section */}
      <Card className="p-6">
        {activeTab === 'topic' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic
              </label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic (e.g., 'Photosynthesis', 'World War II', 'Calculus')"
                className="w-full"
              />
            </div>

            {analysis && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">AI Topic Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700"><strong>Main Topics:</strong> {analysis.mainTopics.join(', ')}</p>
                    <p className="text-blue-700"><strong>Difficulty:</strong> {analysis.difficulty}</p>
                  </div>
                  <div>
                    <p className="text-blue-700"><strong>Suggested Cards:</strong> {analysis.suggestedCardCount}</p>
                    <p className="text-blue-700"><strong>Learning Objectives:</strong> {analysis.learningObjectives.length} identified</p>
                  </div>
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex items-center text-blue-600">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                AI is analyzing your topic...
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your content here (text, notes, etc.)"
                rows={6}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Generation Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Cards
            </label>
            <Input
              type="number"
              min="1"
              max="50"
              value={generationOptions.count}
              onChange={(e) => setGenerationOptions({
                ...generationOptions,
                count: parseInt(e.target.value) || 10
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <Select
              value={generationOptions.difficulty}
              onChange={(e) => setGenerationOptions({
                ...generationOptions,
                difficulty: e.target.value as 'easy' | 'medium' | 'hard'
              })}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learning Style
            </label>
            <Select
              value={generationOptions.learningStyle}
              onChange={(e) => setGenerationOptions({
                ...generationOptions,
                learningStyle: e.target.value as 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed'
              })}
            >
              <option value="mixed">Mixed</option>
              <option value="visual">Visual</option>
              <option value="auditory">Auditory</option>
              <option value="kinesthetic">Kinesthetic</option>
              <option value="reading">Reading</option>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={generationOptions.includeExamples}
                onChange={(e) => setGenerationOptions({
                  ...generationOptions,
                  includeExamples: e.target.checked
                })}
                className="mr-2"
              />
              Include Examples
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={generationOptions.includeDefinitions}
                onChange={(e) => setGenerationOptions({
                  ...generationOptions,
                  includeDefinitions: e.target.checked
                })}
                className="mr-2"
              />
              Include Definitions
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={generationOptions.includeFormulas}
                onChange={(e) => setGenerationOptions({
                  ...generationOptions,
                  includeFormulas: e.target.checked
                })}
                className="mr-2"
              />
              Include Formulas
            </label>
          </div>
          <Button onClick={generateFlashcards} disabled={isGenerating || (!topic.trim() && !content.trim())}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                AI is generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate with Gemini
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Generated Flashcards */}
      {flashcards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              AI-Generated Flashcards ({flashcards.length})
            </h3>
            <Button variant="outline" onClick={addEmptyFlashcard}>
              <Plus className="w-4 h-4 mr-2" />
              Add Card
            </Button>
          </div>

          <div className="space-y-4">
            {flashcards.map((card, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Front (Question)
                    </label>
                    <Textarea
                      value={card.front}
                      onChange={(e) => updateFlashcard(index, 'front', e.target.value)}
                      placeholder="Enter the question or term"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Back (Answer)
                    </label>
                    <Textarea
                      value={card.back}
                      onChange={(e) => updateFlashcard(index, 'back', e.target.value)}
                      placeholder="Enter the answer or definition"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-4">
                    <Select
                      value={card.difficulty}
                      onChange={(e) => updateFlashcard(index, 'difficulty', e.target.value)}
                      className="w-32"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </Select>
                    <Badge variant={card.difficulty === 'easy' ? 'success' : card.difficulty === 'medium' ? 'warning' : 'danger'}>
                      {card.difficulty}
                    </Badge>
                    {card.tags && card.tags.length > 0 && (
                      <div className="flex space-x-1">
                        {card.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => removeFlashcard(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>

                {card.explanation && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>AI Explanation:</strong> {card.explanation}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
