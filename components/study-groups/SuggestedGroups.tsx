'use client';
/**
 * @fileoverview Suggested study groups component
 * 
 * This file is part of the Tether AI learning platform.
 * suggested study groups component for the application.
 */


import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface SuggestedGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  maxMembers: number;
  level: string;
  matchPercentage?: number;
  isNew?: boolean;
}

interface SuggestedGroupsProps {
  groups: SuggestedGroup[];
  onJoin: (groupId: string) => void;
}

export const SuggestedGroups: React.FC<SuggestedGroupsProps> = ({ groups, onJoin }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {groups.map((group) => (
        <div key={group.id} className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">{group.name}</h4>
            {group.isNew ? (
              <Badge variant="info">New</Badge>
            ) : group.matchPercentage ? (
              <Badge variant="success">Match: {group.matchPercentage}%</Badge>
            ) : null}
          </div>
          <p className="text-sm text-gray-600 mb-3">{group.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{group.members}/{group.maxMembers} members</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">{group.level} level</span>
            </div>
            <Button size="small" onClick={() => onJoin(group.id)}>
              Join
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
