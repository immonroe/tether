'use client';
/**
 * @fileoverview Flashcard creation component with AI suggestions
 * 
 * This file is part of the Tether AI learning platform.
 * flashcard creation component with ai suggestions for the application.
 */

import React, { useState } from 'react';
import { Plus, Wand2, Upload, MessageSquare, BookOpen, Loader2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { FlashcardSuggestion, FlashcardGenerationOptions } from '@/lib/ai/flashcardService';
import { flashcardSuggestionService } from '@/lib/ai/flashcardService';
import { Flashcard } from '@/lib/types';

interface FlashcardCreatorProps {
  onSave: (flashcards: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  onCancel: () => void;
  deckId: string;
}

type CreationMode = 'manual' | 'ai-suggestions' | 'topic' | 'document' | 'conversation';

export const FlashcardCreator: React.FC<FlashcardCreatorProps> = ({
  onSave,
  onCancel,
  deckId
}) => {
  const [mode, setMode] = useState<CreationMode>('manual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<FlashcardSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  
  // Manual creation state
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  
  // AI generation state
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [generationOptions, setGenerationOptions] = useState<Partial<FlashcardGenerationOptions>>({
    difficulty: 'medium',
    count: 5,
    style: 'mixed'
  });

  const handleGenerateSuggestions = async () => {
    if (!content.trim()) return;
    
    setIsGenerating(true);
    try {
      let generatedSuggestions: FlashcardSuggestion[] = [];
      
      switch (mode) {
        case 'ai-suggestions':
          generatedSuggestions = await flashcardSuggestionService.generateSuggestions({
            content,
            subject: subject || 'General',
            ...generationOptions
          });
          break;
        case 'topic':
          generatedSuggestions = await flashcardSuggestionService.generateFromTopic(content, {
            subject: subject || 'General',
            ...generationOptions
          });
          break;
        case 'document':
          generatedSuggestions = await flashcardSuggestionService.generateFromDocument(content, {
            subject: subject || 'Document',
            ...generationOptions
          });
          break;
        case 'conversation':
          generatedSuggestions = await flashcardSuggestionService.generateFromConversation([content], {
            subject: subject || 'Conversation',
            ...generationOptions
          });
          break;
      }
      
      setSuggestions(generatedSuggestions);
      setSelectedSuggestions(new Set(generatedSuggestions.map((_, index) => index)));
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // TODO: Show error toast
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveManual = () => {
    if (!front.trim() || !back.trim()) return;
    
    const flashcard = {
      front: front.trim(),
      back: back.trim(),
      difficulty,
      nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      streak: 0,
      deckId,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0
    };
    
    onSave([flashcard]);
  };

  const handleSaveSelected = () => {
    const selectedSuggestionsList = suggestions.filter((_, index) => selectedSuggestions.has(index));
    const flashcards = flashcardSuggestionService.convertToFlashcards(selectedSuggestionsList, deckId);
    onSave(flashcards);
  };

  const toggleSuggestion = (index: number) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSuggestions(newSelected);
  };

  const selectAllSuggestions = () => {
    setSelectedSuggestions(new Set(suggestions.map((_, index) => index)));
  };

  const deselectAllSuggestions = () => {
    setSelectedSuggestions(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={mode === 'manual' ? 'primary' : 'outline'}
          size="small"
          onClick={() => setMode('manual')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Manual
        </Button>
        <Button
          variant={mode === 'ai-suggestions' ? 'primary' : 'outline'}
          size="small"
          onClick={() => setMode('ai-suggestions')}
        >
          <Wand2 className="w-4 h-4 mr-2" />
          AI Suggestions
        </Button>
        <Button
          variant={mode === 'topic' ? 'primary' : 'outline'}
          size="small"
          onClick={() => setMode('topic')}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          From Topic
        </Button>
        <Button
          variant={mode === 'document' ? 'primary' : 'outline'}
          size="small"
          onClick={() => setMode('document')}
        >
          <Upload className="w-4 h-4 mr-2" />
          From Document
        </Button>
        <Button
          variant={mode === 'conversation' ? 'primary' : 'outline'}
          size="small"
          onClick={() => setMode('conversation')}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          From Chat
        </Button>
      </div>

      {/* Manual Creation */}
      {mode === 'manual' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Flashcard</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Front (Question)
              </label>
              <Textarea
                placeholder="Enter the question or prompt..."
                value={front}
                onChange={(e) => setFront(e.target.value)}
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Back (Answer)
              </label>
              <Textarea
                placeholder="Enter the answer or explanation..."
                value={back}
                onChange={(e) => setBack(e.target.value)}
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <Select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSaveManual} disabled={!front.trim() || !back.trim()}>
                Save Flashcard
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* AI Generation */}
      {mode !== 'manual' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Generate Flashcards with AI
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject (Optional)
              </label>
              <Input
                placeholder="e.g., Mathematics, Biology, History..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {mode === 'topic' && 'Topic or Question'}
                {mode === 'document' && 'Document Content'}
                {mode === 'conversation' && 'Conversation Content'}
                {mode === 'ai-suggestions' && 'Content to Generate From'}
              </label>
              <Textarea
                placeholder={
                  mode === 'topic' ? 'Enter a topic or question to generate flashcards about...' :
                  mode === 'document' ? 'Paste your document content here...' :
                  mode === 'conversation' ? 'Paste your conversation or chat content here...' :
                  'Enter content to generate flashcards from...'
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <Select
                  value={generationOptions.difficulty || 'medium'}
                  onChange={(e) => setGenerationOptions(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Count
                </label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={(generationOptions.count || 5).toString()}
                  onChange={(e) => setGenerationOptions(prev => ({ ...prev, count: parseInt(e.target.value) || 5 }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style
                </label>
                <Select
                  value={generationOptions.style || 'mixed'}
                  onChange={(e) => setGenerationOptions(prev => ({ ...prev, style: e.target.value as 'factual' | 'conceptual' | 'application' | 'mixed' }))}
                >
                  <option value="factual">Factual</option>
                  <option value="conceptual">Conceptual</option>
                  <option value="application">Application</option>
                  <option value="mixed">Mixed</option>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleGenerateSuggestions} 
                disabled={!content.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Suggestions
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Suggestions Display */}
      {suggestions.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Generated Suggestions ({suggestions.length})
            </h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="small" onClick={selectAllSuggestions}>
                Select All
              </Button>
              <Button variant="outline" size="small" onClick={deselectAllSuggestions}>
                Deselect All
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedSuggestions.has(index)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleSuggestion(index)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {selectedSuggestions.has(index) ? (
                        <Check className="w-4 h-4 text-blue-500" />
                      ) : (
                        <div className="w-4 h-4 border border-gray-300 rounded" />
                      )}
                      <Badge variant={suggestion.difficulty === 'easy' ? 'success' : suggestion.difficulty === 'medium' ? 'warning' : 'danger'}>
                        {suggestion.difficulty}
                      </Badge>
                      {suggestion.category && (
                        <Badge variant="info">{suggestion.category}</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="font-medium text-gray-900">Q: {suggestion.front}</p>
                      </div>
                      <div>
                        <p className="text-gray-700">A: {suggestion.back}</p>
                      </div>
                      {suggestion.explanation && (
                        <div>
                          <p className="text-sm text-gray-600 italic">{suggestion.explanation}</p>
                        </div>
                      )}
                      {suggestion.tags && suggestion.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {suggestion.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="info">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSelected} 
              disabled={selectedSuggestions.size === 0}
            >
              Save Selected ({selectedSuggestions.size})
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
