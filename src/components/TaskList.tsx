
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Play, CheckCircle, AlertTriangle, Trash2, RotateCcw } from 'lucide-react';
import { Task, DIFFICULTY_CONFIG } from '@/hooks/useTaskForge';

interface TaskListProps {
  tasks: Task[];
  onStartTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onRevertTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const getStateIcon = (state: string) => {
  switch (state) {
    case 'todo': return <Target className="h-4 w-4 text-muted-foreground" />;
    case 'inprogress': return <Play className="h-4 w-4 text-blue-400" />;
    case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
    case 'missed': return <AlertTriangle className="h-4 w-4 text-red-400" />;
    default: return <Target className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStateLabel = (state: string) => {
  switch (state) {
    case 'todo': return 'To Do';
    case 'inprogress': return 'In Progress';
    case 'completed': return 'Completed';
    case 'missed': return 'Missed';
    default: return 'Unknown';
  }
};

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onStartTask,
  onCompleteTask,
  onRevertTask,
  onDeleteTask
}) => {
  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const config = DIFFICULTY_CONFIG[task.difficulty];
        return (
          <Card key={task.id} className={`glass-card transition-all duration-300 hover-scale ${
            task.state === 'completed' ? 'opacity-60' : 
            task.state === 'missed' ? 'border-red-500/50 bg-red-500/5' :
            task.state === 'inprogress' ? 'border-blue-500/50 bg-blue-500/5' :
            'hover:scale-[1.02]'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStateIcon(task.state)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className={`font-medium ${task.state === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </p>
                      {task.is_default && (
                        <Badge variant="outline" className="text-xs">
                          Daily
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className={config.color}>
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {task.category}
                      </span>
                      {task.state !== 'completed' && task.state !== 'missed' && (
                        <span className="text-xs text-muted-foreground">
                          +{config.xp} XP, +{config.coins} coins
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {getStateLabel(task.state)}
                  </Badge>
                  
                  {task.state === 'todo' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onStartTask(task.id)}
                      >
                        <Play className="h-3 w-3" />
                        Start
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDeleteTask(task.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  
                  {task.state === 'inprogress' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => onCompleteTask(task.id)}
                      >
                        <CheckCircle className="h-3 w-3" />
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDeleteTask(task.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  
                  {task.state === 'completed' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRevertTask(task.id)}
                      >
                        <RotateCcw className="h-3 w-3" />
                        Revert
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDeleteTask(task.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
