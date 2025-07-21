
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/hooks/useTaskForge';

interface QuestStatsProps {
  tasks: Task[];
}

export const QuestStats: React.FC<QuestStatsProps> = ({ tasks }) => {
  const completedTasks = tasks.filter(t => t.state === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.state === 'inprogress').length;
  const successRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Quest Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Total Quests</span>
          <span className="font-medium">{tasks.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Completed</span>
          <span className="font-medium text-green-400">{completedTasks}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">In Progress</span>
          <span className="font-medium text-blue-400">{inProgressTasks}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Success Rate</span>
          <span className="font-medium">{successRate}%</span>
        </div>
      </CardContent>
    </Card>
  );
};
