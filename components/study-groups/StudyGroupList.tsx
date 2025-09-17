'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StudyGroup } from '@/lib/types';

interface StudyGroupListProps {
  groups: StudyGroup[];
  onJoin: (groupId: string) => void;
}

export const StudyGroupList: React.FC<StudyGroupListProps> = ({ groups, onJoin }) => {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{group.name}</h4>
              <p className="text-sm text-gray-500">{group.members} members • {group.subject}</p>
              <p className="text-sm text-gray-600">Next session: {group.nextSession}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={group.status === 'active' ? 'success' : 'warning'}>
              {group.status}
            </Badge>
            <Button variant="outline" size="small" onClick={() => onJoin(group.id)}>
              Join Session
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
