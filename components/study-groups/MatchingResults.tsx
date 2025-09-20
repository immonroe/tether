'use client';
/**
 * @fileoverview Matching results component for study groups
 * 
 * This file is part of the Tether AI learning platform.
 * Matching results component for study group matching.
 */

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UserMatch } from '@/lib/types';
import { Users, Clock, Target, BookOpen, Brain } from 'lucide-react';

interface MatchingResultsProps {
  matches: UserMatch[];
  onInvite: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
  isLoading?: boolean;
}

export const MatchingResults: React.FC<MatchingResultsProps> = ({
  matches,
  onInvite,
  onViewProfile,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
        <p className="text-gray-500">
          Try adjusting your preferences or check back later for new study partners.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Potential Study Partners ({matches.length})
        </h3>
        <Badge variant="info">
          Sorted by compatibility
        </Badge>
      </div>

      {matches.map((match) => (
        <div key={match.userId} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-medium text-gray-900">{match.name || 'Anonymous User'}</h4>
                  <Badge 
                    variant={match.matchScore >= 80 ? 'success' : match.matchScore >= 60 ? 'warning' : 'info'}
                  >
                    {match.matchScore}% match
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  {/* Subjects */}
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span>
                      {match.preferences.subjects.slice(0, 3).join(', ')}
                      {match.preferences.subjects.length > 3 && ` +${match.preferences.subjects.length - 3} more`}
                    </span>
                  </div>

                  {/* Skill Level */}
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span className="capitalize">{match.preferences.skillLevel}</span>
                  </div>

                  {/* Learning Style */}
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-gray-400" />
                    <span className="capitalize">{match.preferences.learningStyle}</span>
                  </div>

                  {/* Study Frequency */}
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="capitalize">{match.preferences.studyFrequency}</span>
                  </div>
                </div>

                {/* Matching Factors */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {match.matchingFactors.subject && (
                    <Badge variant="success" size="small">Subject Match</Badge>
                  )}
                  {match.matchingFactors.skillLevel && (
                    <Badge variant="success" size="small">Skill Level</Badge>
                  )}
                  {match.matchingFactors.availability && (
                    <Badge variant="success" size="small">Available</Badge>
                  )}
                  {match.matchingFactors.learningGoals > 0 && (
                    <Badge variant="info" size="small">
                      {match.matchingFactors.learningGoals} Goals
                    </Badge>
                  )}
                  {match.matchingFactors.learningStyle && (
                    <Badge variant="success" size="small">Learning Style</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {onViewProfile && (
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => onViewProfile(match.userId)}
                >
                  View Profile
                </Button>
              )}
              <Button
                size="small"
                onClick={() => onInvite(match.userId)}
                disabled={match.matchScore < 50}
              >
                Invite to Group
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
