'use client';
/**
 * @fileoverview Study schedule component for displaying upcoming study sessions
 * 
 * This file is part of the Tether AI learning platform.
 * Component for showing scheduled study sessions and recommendations.
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Target, TrendingUp, Play, Edit, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { schedulingService, StudySessionPlan, StudyRecommendation } from '@/lib/ai/schedulingService';

interface StudyScheduleProps {
  userId: string;
  onStartSession?: (sessionId: string) => void;
  onEditSession?: (sessionId: string) => void;
}

export const StudySchedule: React.FC<StudyScheduleProps> = ({
  userId,
  onStartSession,
  onEditSession
}) => {
  const [sessions, setSessions] = useState<StudySessionPlan[]>([]);
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState<'sessions' | 'recommendations'>('sessions');

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = () => {
    const upcomingSessions = schedulingService.getUpcomingSessions(userId);
    const studyRecommendations = schedulingService.getStudyRecommendations(userId);
    
    setSessions(upcomingSessions);
    setRecommendations(studyRecommendations);
  };

  const handleStartSession = (sessionId: string) => {
    onStartSession?.(sessionId);
  };

  const handleEditSession = (sessionId: string) => {
    onEditSession?.(sessionId);
  };

  const handleRescheduleSession = (sessionId: string, newTime: Date) => {
    schedulingService.rescheduleSession(sessionId, newTime);
    loadData();
  };

  const getSessionPriorityColor = (priority: StudySessionPlan['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSessionTypeColor = (type: StudySessionPlan['sessionType']) => {
    switch (type) {
      case 'review':
        return 'text-blue-600 bg-blue-100';
      case 'new_cards':
        return 'text-purple-600 bg-purple-100';
      case 'mixed':
        return 'text-indigo-600 bg-indigo-100';
      case 'catch_up':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRecommendationColor = (type: StudyRecommendation['type']) => {
    switch (type) {
      case 'schedule':
        return 'text-blue-600 bg-blue-100';
      case 'reminder':
        return 'text-yellow-600 bg-yellow-100';
      case 'break':
        return 'text-green-600 bg-green-100';
      case 'intensive':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Calendar className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Study Schedule</h2>
            <p className="text-sm text-gray-600">Your upcoming study sessions and recommendations</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'sessions'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upcoming Sessions ({sessions.length})
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'recommendations'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Recommendations ({recommendations.length})
        </button>
      </div>

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <Card className="p-6 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Sessions</h3>
              <p className="text-gray-600 mb-4">
                Your study schedule is clear. Check recommendations for study suggestions.
              </p>
              <Button onClick={() => setActiveTab('recommendations')}>
                View Recommendations
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id} className="p-6">
                  <div className="space-y-4">
                    {/* Session Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {session.sessionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Session
                          </h3>
                          <Badge className={getSessionPriorityColor(session.priority)}>
                            {session.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTime(session.scheduledFor)}
                          </span>
                          <span className="flex items-center">
                            <Target className="w-4 h-4 mr-1" />
                            {session.cardIds.length} cards
                          </span>
                          <span className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {session.estimatedDuration} min
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => handleEditSession(session.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleStartSession(session.id)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      </div>
                    </div>

                    {/* Session Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Session Type</p>
                        <Badge className={getSessionTypeColor(session.sessionType)}>
                          {session.sessionType.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Difficulty</p>
                        <Badge variant="info">
                          {session.difficulty}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Scheduled For</p>
                        <p className="text-sm text-gray-600">{formatDate(session.scheduledFor)}</p>
                      </div>
                    </div>

                    {/* Goals */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Session Goals</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{session.goals.targetCards}</p>
                          <p className="text-xs text-gray-600">Target Cards</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{session.goals.targetAccuracy}%</p>
                          <p className="text-xs text-gray-600">Target Accuracy</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{session.goals.targetTime}</p>
                          <p className="text-xs text-gray-600">Target Time (min)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <Card className="p-6 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
              <p className="text-gray-600">
                No specific recommendations at the moment. Keep up the great work!
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {recommendations.map((recommendation, index) => (
                <Card key={index} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${getRecommendationColor(recommendation.type)}`}>
                          {recommendation.type === 'schedule' && <Calendar className="w-4 h-4" />}
                          {recommendation.type === 'reminder' && <Clock className="w-4 h-4" />}
                          {recommendation.type === 'break' && <X className="w-4 h-4" />}
                          {recommendation.type === 'intensive' && <TrendingUp className="w-4 h-4" />}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {recommendation.title}
                            </h3>
                            <Badge className={getRecommendationColor(recommendation.type)}>
                              {recommendation.priority}
                            </Badge>
                          </div>
                          <p className="text-gray-600">{recommendation.message}</p>
                          <p className="text-sm text-gray-500">{recommendation.reason}</p>
                        </div>
                      </div>
                    </div>

                    {recommendation.suggestedTime && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">
                            Suggested time: {formatTime(recommendation.suggestedTime)}
                          </span>
                        </div>
                        {recommendation.estimatedDuration && (
                          <span className="text-sm text-gray-600">
                            ~{recommendation.estimatedDuration} minutes
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
