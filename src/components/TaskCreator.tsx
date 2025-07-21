
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Target } from 'lucide-react';
import { DIFFICULTY_CONFIG } from '@/hooks/useTaskForge';

interface TaskCreatorProps {
  onCreateTask: (task: {
    title: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'boss';
    state: 'todo';
    is_default: false;
  }) => void;
}

export const TaskCreator: React.FC<TaskCreatorProps> = ({ onCreateTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newTaskDifficulty, setNewTaskDifficulty] = useState<'easy' | 'medium' | 'hard' | 'boss'>('easy');

  const addTask = () => {
    if (!newTaskTitle.trim() || !newTaskCategory.trim()) return;

    onCreateTask({
      title: newTaskTitle,
      category: newTaskCategory,
      difficulty: newTaskDifficulty,
      state: 'todo',
      is_default: false
    });

    setNewTaskTitle('');
    setNewTaskCategory('');
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Forge New Quest</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Quest title..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <Input
            placeholder="Category..."
            value={newTaskCategory}
            onChange={(e) => setNewTaskCategory(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <Select value={newTaskDifficulty} onValueChange={(value: 'easy' | 'medium' | 'hard' | 'boss') => setNewTaskDifficulty(value)}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <span className={config.color}>{config.label} (+{config.xp} XP, +{config.coins} coins)</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addTask} className="primary-gradient">
            <Plus className="h-4 w-4" />
            Forge Quest
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
