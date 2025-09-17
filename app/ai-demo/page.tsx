'use client';

import React from 'react';
import { AITestComponent } from '@/components/flashcards/AITestComponent';
import { GeminiFlashcardCreator } from '@/components/flashcards/GeminiFlashcardCreator';
import { Brain, Zap, Star, Rocket, Upload } from 'lucide-react';

export default function AIDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <Brain className="w-8 h-8 mr-3 text-blue-600" />
              AI-Powered Learning Platform
            </h1>
            <p className="text-lg text-gray-600">
              Powered by Google Gemini - Free, no credit card required. Test intelligent flashcard generation with multiple AI models.
            </p>
          </div>

          {/* Gemini Models Showcase */}
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Gemini Models</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold">Gemini 2.5 Pro</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">Most powerful model for complex reasoning</p>
                <div className="text-xs text-purple-600 font-medium">Reasoning & Analysis</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Rocket className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold">Gemini 2.5 Flash</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">Newest multimodal with next-gen features</p>
                <div className="text-xs text-blue-600 font-medium">Multimodal</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold">Gemini 2.5 Flash Lite</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">Fastest and most cost-efficient</p>
                <div className="text-xs text-green-600 font-medium">High Frequency</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Upload className="w-5 h-5 text-pink-600" />
                  <h3 className="font-semibold">Gemini 2.5 Flash Image</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">Highly effective image generation</p>
                <div className="text-xs text-pink-600 font-medium">Image Generation</div>
              </div>
            </div>
          </div>
          
          <AITestComponent />
          
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              How It Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">With Gemini AI</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Structured JSON output for reliable parsing</li>
                  <li>• Multiple specialized models for different tasks</li>
                  <li>• Advanced topic analysis and suggestions</li>
                  <li>• Learning style adaptation</li>
                  <li>• Content-based card creation</li>
                  <li>• Study tips and strategies</li>
                  <li>• 100% free, no credit card required</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Fallback Mode</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Pre-defined educational content</li>
                  <li>• Basic flashcard templates</li>
                  <li>• Simple topic analysis</li>
                  <li>• Study technique suggestions</li>
                  <li>• Always available</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              🎉 Get Started with Gemini (Free!)
            </h3>
            <p className="text-green-800 mb-4">
              Get your free Gemini API key and add it to your <code className="bg-green-100 px-1 rounded">.env.local</code> file:
            </p>
            <div className="bg-green-100 rounded p-4 font-mono text-sm">
              <div># Get your free API key at: https://aistudio.google.com/app/apikey</div>
              <div>GEMINI_API_KEY=your_gemini_api_key_here</div>
              <div></div>
              <div># Optional: Other providers</div>
              <div># OPENAI_API_KEY=your_key_here</div>
              <div># ANTHROPIC_API_KEY=your_key_here</div>
            </div>
            <div className="mt-4 flex space-x-4">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Get Free API Key
              </a>
              <a 
                href="https://ai.google.dev/docs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                View Documentation
              </a>
            </div>
            <p className="text-green-800 mt-4 text-sm">
              See <code className="bg-green-100 px-1 rounded">AI_SETUP.md</code> for detailed instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
