'use client';
/**
 * @fileoverview Flashcard study statistics and analytics component
 * 
 * This file is part of the Tether AI learning platform.
 * displays flashcard study statistics and analytics for spaced repetition.
 */

import React, { useState } from 'react';
import { 
  BarChart3, 
  Target, 
  Clock, 
  TrendingUp, 
  Calendar,
  RotateCcw,
  Brain,
  Award,
  Zap,
  Download,
  Upload,
  FileText,
  Activity,
  PieChart,
  BarChart
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { StudyStats, ReviewSession } from '@/lib/ai/sm2Service';
import { Flashcard } from '@/lib/types';

interface FlashcardStatsProps {
  stats: StudyStats;
  recentSessions?: ReviewSession[];
  flashcards?: Flashcard[];
  onExport?: () => void;
  onImport?: (file: File) => void;
  className?: string;
}

interface AnalyticsData {
  dailyProgress: { date: string; cardsReviewed: number; accuracy: number }[];
  difficultyDistribution: { difficulty: string; count: number; percentage: number }[];
  studyStreaks: { date: string; streak: number }[];
  performanceTrends: { date: string; averageEaseFactor: number; averageInterval: number }[];
}

export const FlashcardStats: React.FC<FlashcardStatsProps> = ({
  stats,
  recentSessions = [],
  flashcards = [],
  onExport,
  onImport,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'export'>('overview');
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);

  // Generate analytics data
  const generateAnalyticsData = (): AnalyticsData => {
    const now = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    // Mock data for demonstration - in real app, this would come from database
    const dailyProgress = last30Days.map(date => ({
      date,
      cardsReviewed: Math.floor(Math.random() * 20) + 5,
      accuracy: Math.random() * 40 + 60 // 60-100%
    }));

    const difficultyDistribution = [
      { difficulty: 'Easy', count: flashcards.filter(f => f.difficulty === 'easy').length, percentage: 0 },
      { difficulty: 'Medium', count: flashcards.filter(f => f.difficulty === 'medium').length, percentage: 0 },
      { difficulty: 'Hard', count: flashcards.filter(f => f.difficulty === 'hard').length, percentage: 0 }
    ].map(item => ({
      ...item,
      percentage: flashcards.length > 0 ? (item.count / flashcards.length) * 100 : 0
    }));

    const studyStreaks = last30Days.map(date => ({
      date,
      streak: Math.floor(Math.random() * 10) + 1
    }));

    const performanceTrends = last30Days.map(date => ({
      date,
      averageEaseFactor: 2.0 + Math.random() * 1.0,
      averageInterval: 1 + Math.random() * 20
    }));

    return {
      dailyProgress,
      difficultyDistribution,
      studyStreaks,
      performanceTrends
    };
  };

  const analyticsData = generateAnalyticsData();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImport) {
      onImport(file);
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'New':
        return 'bg-gray-100 text-gray-800';
      case 'Learning':
        return 'bg-yellow-100 text-yellow-800';
      case 'Mature':
        return 'bg-green-100 text-green-800';
      case 'Mastered':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (current: number, total: number) => {
    return total > 0 ? (current / total) * 100 : 0;
  };

  const getEaseFactorColor = (easeFactor: number) => {
    if (easeFactor >= 2.5) return 'text-green-600';
    if (easeFactor >= 2.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getIntervalColor = (interval: number) => {
    if (interval >= 30) return 'text-green-600';
    if (interval >= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'overview'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'analytics'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Activity className="w-4 h-4 inline mr-2" />
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'export'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Download className="w-4 h-4 inline mr-2" />
          Import/Export
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cards</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCards}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Due Today</p>
              <p className="text-2xl font-bold text-orange-600">{stats.dueCards}</p>
            </div>
            <Target className="w-8 h-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Cards</p>
              <p className="text-2xl font-bold text-purple-600">{stats.newCards}</p>
            </div>
            <Brain className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accuracy</p>
              <p className="text-2xl font-bold text-green-600">{stats.accuracyRate.toFixed(1)}%</p>
            </div>
            <Award className="w-8 h-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Progress</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Cards Mastered</span>
              <span className="font-medium">{stats.reviewCards} / {stats.totalCards}</span>
            </div>
            <ProgressBar 
              progress={getProgressPercentage(stats.reviewCards, stats.totalCards)} 
              className="h-2"
            />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">New Cards</span>
              <span className="font-medium">{stats.newCards} / {stats.totalCards}</span>
            </div>
            <ProgressBar 
              progress={getProgressPercentage(stats.newCards, stats.totalCards)} 
              className="h-2"
            />
          </div>
        </div>
      </Card>

      {/* Algorithm Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spaced Repetition Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average Ease Factor</span>
              <span className={`font-medium ${getEaseFactorColor(stats.averageEaseFactor)}`}>
                {stats.averageEaseFactor}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average Interval</span>
              <span className={`font-medium ${getIntervalColor(stats.averageInterval)}`}>
                {stats.averageInterval} days
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Longest Streak</span>
              <span className="font-medium text-blue-600">{stats.longestStreak}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Reviews</span>
              <span className="font-medium text-purple-600">{stats.totalReviews}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-600">New Cards</span>
              </div>
              <span className="font-medium">{stats.newCards}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Learning</span>
              </div>
              <span className="font-medium">{stats.reviewCards - stats.newCards}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Mastered</span>
              </div>
              <span className="font-medium">{stats.totalCards - stats.dueCards - stats.newCards}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Study Sessions</h3>
          <div className="space-y-3">
            {recentSessions.slice(0, 5).map((session, index) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Session {recentSessions.length - index}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.completedCards.length} cards • {session.accuracy.toFixed(1)}% accuracy
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {session.endTime ? 
                      Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60) : 0} min
                  </p>
                  <p className="text-xs text-gray-500">
                    {session.endTime?.toLocaleDateString() || 'In progress'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Study Tips */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Tips</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p>Review cards daily for optimal retention. The algorithm adjusts intervals based on your performance.</p>
          </div>
          <div className="flex items-start space-x-2">
            <Target className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p>Be honest with your ratings. "Again" and "Hard" help the algorithm learn your needs.</p>
          </div>
          <div className="flex items-start space-x-2">
            <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <p>Higher ease factors mean longer intervals. Focus on understanding, not just memorization.</p>
          </div>
        </div>
      </Card>
        </>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Daily Progress Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Study Progress</h3>
            <div className="h-64 flex items-end space-x-1">
              {analyticsData.dailyProgress.slice(-14).map((day, index) => (
                <div key={day.date} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${(day.cardsReviewed / 25) * 200}px` }}
                    title={`${day.date}: ${day.cardsReviewed} cards`}
                  />
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(day.date).getDate()}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Difficulty Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Difficulty Distribution</h3>
              <div className="space-y-3">
                {analyticsData.difficultyDistribution.map((item) => (
                  <div key={item.difficulty} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        item.difficulty === 'Easy' ? 'bg-green-400' :
                        item.difficulty === 'Medium' ? 'bg-yellow-400' : 'bg-red-400'
                      }`} />
                      <span className="text-sm text-gray-600">{item.difficulty}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{item.count}</span>
                      <span className="text-xs text-gray-500">({item.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Streaks</h3>
              <div className="space-y-2">
                {analyticsData.studyStreaks.slice(-7).map((day) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">{day.streak}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Performance Trends */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Average Ease Factor</h4>
                <div className="h-32 flex items-end space-x-1">
                  {analyticsData.performanceTrends.slice(-14).map((day, index) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-green-500 rounded-t"
                        style={{ height: `${(day.averageEaseFactor / 3.5) * 120}px` }}
                        title={`${day.date}: ${day.averageEaseFactor.toFixed(2)}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Average Interval (days)</h4>
                <div className="h-32 flex items-end space-x-1">
                  {analyticsData.performanceTrends.slice(-14).map((day, index) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-purple-500 rounded-t"
                        style={{ height: `${(day.averageInterval / 30) * 120}px` }}
                        title={`${day.date}: ${day.averageInterval.toFixed(1)} days`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="space-y-6">
          {/* Export Section */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Flashcards</h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Export your flashcards to CSV or JSON format for backup or sharing.
              </p>
              <div className="flex space-x-3">
                <Button onClick={handleExport} className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Export as CSV</span>
                </Button>
                <Button onClick={handleExport} variant="outline" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Export as JSON</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Import Section */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Flashcards</h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Import flashcards from CSV or JSON files. Supported formats include Anki exports and custom formats.
              </p>
              <div className="flex space-x-3">
                <input
                  ref={setFileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef?.click()} 
                  className="flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose File</span>
                </Button>
              </div>
              <div className="text-xs text-gray-500">
                <p>Supported formats:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>CSV: front,back,difficulty,tags</li>
                  <li>JSON: Array of flashcard objects</li>
                  <li>Anki: .txt files with tab-separated values</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Bulk Operations */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Operations</h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Perform bulk operations on your flashcard collection.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset All Progress</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Reschedule All</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Mark All as Due</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Brain className="w-4 h-4" />
                  <span>Optimize Intervals</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
