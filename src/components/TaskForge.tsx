
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, Trophy, Coins, Zap, Target, Calendar, Filter, Play, 
  CheckCircle, Clock, AlertTriangle, Trash2, RotateCcw, Sun, Moon,
  Save, Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import { RealTimeClock } from './RealTimeClock';
import confetti from 'canvas-confetti';

export interface Task {
  id: string;
  title: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'boss';
  state: 'todo' | 'inprogress' | 'completed' | 'missed';
  isDefault: boolean;
  createdAt: Date;
  completedAt?: Date;
  deadline?: Date;
}

interface PlayerStats {
  totalXP: number;
  coins: number;
  level: number;
  streak: number;
  lastCompletedDate?: Date;
  lastDayChecked?: string;
}

const DIFFICULTY_CONFIG = {
  easy: { xp: 10, coins: 5, color: 'text-green-400', label: 'Easy' },
  medium: { xp: 25, coins: 10, color: 'text-yellow-400', label: 'Medium' },
  hard: { xp: 50, coins: 20, color: 'text-orange-400', label: 'Hard' },
  boss: { xp: 100, coins: 30, color: 'text-purple-400', label: 'Boss' }
};

const TIER_BADGES = [
  { name: 'Bronze', minXP: 0, color: 'text-bronze', icon: '🥉' },
  { name: 'Silver', minXP: 100, color: 'text-silver', icon: '🥈' },
  { name: 'Gold', minXP: 300, color: 'text-gold', icon: '🥇' },
  { name: 'Platinum', minXP: 600, color: 'text-platinum', icon: '💎' },
  { name: 'Ultra', minXP: 1000, color: 'text-ultra', icon: '⭐' }
];

const DEFAULT_ROUTINES = [
  { title: 'DSA Practice', category: 'Coding', difficulty: 'medium' as const },
  { title: 'Flutter Dev', category: 'Development', difficulty: 'hard' as const },
  { title: 'System Design Review', category: 'Learning', difficulty: 'medium' as const },
  { title: 'Brain Detox', category: 'Wellness', difficulty: 'easy' as const }
];

export const TaskForge: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newTaskDifficulty, setNewTaskDifficulty] = useState<Task['difficulty']>('easy');
  const [filter, setFilter] = useState<'all' | 'todo' | 'inprogress' | 'completed'>('all');
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    totalXP: 0,
    coins: 0,
    level: 1,
    streak: 0
  });
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskforge-tasks');
    const savedStats = localStorage.getItem('taskforge-stats');
    
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        deadline: task.deadline ? new Date(task.deadline) : undefined
      }));
      setTasks(parsedTasks);
    }
    
    if (savedStats) {
      const parsedStats = JSON.parse(savedStats);
      setPlayerStats({
        ...parsedStats,
        lastCompletedDate: parsedStats.lastCompletedDate ? new Date(parsedStats.lastCompletedDate) : undefined
      });
    }
  }, []);

  // Save to localStorage whenever tasks or stats change
  useEffect(() => {
    localStorage.setItem('taskforge-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskforge-stats', JSON.stringify(playerStats));
  }, [playerStats]);

  // Generate default daily routines
  useEffect(() => {
    const today = new Date().toDateString();
    const lastDefaultsAdded = localStorage.getItem('lastDefaultsAddedDate');
    if (lastDefaultsAdded === today) return;

    const hasDefaultsForToday = tasks.some(task => 
      task.isDefault && task.createdAt.toDateString() === today
    );

    if (!hasDefaultsForToday) {
      const defaultTasks: Task[] = DEFAULT_ROUTINES.map(routine => ({
        id: `default-${Date.now()}-${Math.random()}`,
        title: routine.title,
        category: routine.category,
        difficulty: routine.difficulty,
        state: 'todo',
        isDefault: true,
        createdAt: new Date(),
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }));
      setTasks(prev => [...prev, ...defaultTasks]);
      localStorage.setItem('lastDefaultsAddedDate', today);
    }
  }, []);

  // Check for missed tasks
  useEffect(() => {
    const checkMissedTasks = () => {
      const now = new Date();
      const today = now.toDateString();
      
      if (playerStats.lastDayChecked === today) return;

      const missedTasks = tasks.filter(task => 
        task.deadline &&
        task.deadline < now &&
        (task.state === 'todo' || task.state === 'inprogress')
      );

      if (missedTasks.length > 0) {
        let totalPenalty = 0;
        missedTasks.forEach(task => {
          totalPenalty += 5;
        });

        setTasks(prev => prev.map(task => 
          missedTasks.includes(task) 
            ? { ...task, state: 'missed' as const }
            : task
        ));

        setPlayerStats(prev => ({
          ...prev,
          totalXP: Math.max(0, prev.totalXP - totalPenalty),
          streak: 0,
          lastDayChecked: today
        }));

        toast({
          title: "Tasks Missed!",
          description: `Lost ${totalPenalty} XP. Streak reset to 0.`,
          variant: "destructive",
        });
      }
    };

    const interval = setInterval(checkMissedTasks, 60000);
    return () => clearInterval(interval);
  }, [tasks, playerStats.lastDayChecked, toast]);

  // Calculate level from XP
  useEffect(() => {
    const newLevel = Math.floor(playerStats.totalXP / 100) + 1;
    if (newLevel > playerStats.level) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      const currentTier = getCurrentTier();
      toast({
        title: `🎉 Level Up! Level ${newLevel}`,
        description: `You've reached ${currentTier.name} tier! ${currentTier.icon}`,
      });
    }
    setPlayerStats(prev => ({ ...prev, level: newLevel }));
  }, [playerStats.totalXP, playerStats.level, toast]);

  const getCurrentTier = () => {
    return TIER_BADGES.slice().reverse().find(tier => playerStats.totalXP >= tier.minXP) || TIER_BADGES[0];
  };

  const getNextTier = () => {
    return TIER_BADGES.find(tier => playerStats.totalXP < tier.minXP);
  };

  const [isAdding, setIsAdding] = useState(false); // Add this at the top of your component

const addTask = async () => {
  if (isAdding) return; // Prevent double submission

  if (!newTaskTitle.trim() || !newTaskCategory.trim()) return;

  setIsAdding(true);

  const newTask: Task = {
    id: Date.now().toString(),
    title: newTaskTitle,
    category: newTaskCategory,
    difficulty: newTaskDifficulty,
    state: 'todo',
    isDefault: false,
    createdAt: new Date()
  };

  setTasks(prev => [...prev, newTask]);
  setNewTaskTitle('');
  setNewTaskCategory('');

  toast({
    title: "Quest Added!",
    description: "New challenge awaits completion!",
  });

  setIsAdding(false);
};
  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: "Quest Removed",
      description: "Task has been deleted from your quest log.",
    });
  };

  const startTask = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, state: 'inprogress' as const } : task
    ));
    
    toast({
      title: "Quest Started!",
      description: "Good luck on your mission!",
    });
  };

  const completeTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.state !== 'inprogress') return;

    const config = DIFFICULTY_CONFIG[task.difficulty];
    const newXP = playerStats.totalXP + config.xp;
    const newCoins = playerStats.coins + config.coins;
    
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, state: 'completed' as const, completedAt: new Date() }
        : t
    ));

    const today = new Date();
    const completedToday = tasks.some(t => 
      t.state === 'completed' && 
      t.completedAt?.toDateString() === today.toDateString()
    );

    setPlayerStats(prev => ({
      ...prev,
      totalXP: newXP,
      coins: newCoins,
      streak: completedToday ? prev.streak : prev.streak + 1,
      lastCompletedDate: today
    }));

    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 }
    });

    toast({
      title: "Quest Completed! 🎉",
      description: `+${config.xp} XP, +${config.coins} coins earned!`,
    });
  };

  const revertTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.state !== 'completed') return;

    const config = DIFFICULTY_CONFIG[task.difficulty];
    
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, state: 'todo' as const, completedAt: undefined }
        : t
    ));

    setPlayerStats(prev => ({
      ...prev,
      totalXP: Math.max(0, prev.totalXP - config.xp),
      coins: Math.max(0, prev.coins - config.coins)
    }));

    toast({
      title: "Quest Reverted",
      description: `Task moved back to To Do. -${config.xp} XP, -${config.coins} coins.`,
    });
  };

  const saveProgress = () => {
    // This will be enhanced with Supabase integration later
    toast({
      title: "Progress Saved Locally",
      description: "Your progress has been saved to local storage. Supabase integration coming soon!",
    });
  };

  const getStateIcon = (state: Task['state']) => {
    switch (state) {
      case 'todo': return <Target className="h-4 w-4 text-muted-foreground" />;
      case 'inprogress': return <Play className="h-4 w-4 text-blue-400" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'missed': return <AlertTriangle className="h-4 w-4 text-red-400" />;
    }
  };

  const getStateLabel = (state: Task['state']) => {
    switch (state) {
      case 'todo': return 'To Do';
      case 'inprogress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'missed': return 'Missed';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.state === filter;
  });

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const progressToNext = nextTier 
    ? ((playerStats.totalXP - currentTier.minXP) / (nextTier.minXP - currentTier.minXP)) * 100
    : 100;

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            TaskForge
          </h1>
          <p className="text-muted-foreground mt-1">
            Your daily grind. Reinvented with AI.
          </p>
          <p className="text-xs text-muted-foreground">
            Crafted with love by Yuvi.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <RealTimeClock />
          
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
            <Moon className="h-4 w-4" />
          </div>
          
          <Button onClick={saveProgress} variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Progress
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 rounded-full xp-gradient">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Level {playerStats.level}</p>
              <p className="text-2xl font-bold text-xp">{playerStats.totalXP} XP</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 rounded-full coin-gradient">
              <Coins className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Coins</p>
              <p className="text-2xl font-bold text-coin">{playerStats.coins}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 rounded-full primary-gradient">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tier</p>
              <p className={`text-xl font-bold ${currentTier.color}`}>
                {currentTier.icon} {currentTier.name}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 rounded-full bg-destructive">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Streak</p>
              <p className="text-2xl font-bold text-destructive">{playerStats.streak} days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress to Next Tier */}
      {nextTier && (
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Progress to {nextTier.name} {nextTier.icon}
              </span>
              <span className="text-sm text-muted-foreground">
                {playerStats.totalXP}/{nextTier.minXP} XP
              </span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Management */}
        <div className="lg:col-span-2 space-y-4">
          {/* Add Task */}
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
                <Select value={newTaskDifficulty} onValueChange={(value: Task['difficulty']) => setNewTaskDifficulty(value)}>
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

          {/* Task Filters */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filter:</span>
                <div className="flex space-x-2">
                  {(['all', 'todo', 'inprogress', 'completed'] as const).map((filterType) => (
                    <Button
                      key={filterType}
                      variant={filter === filterType ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter(filterType)}
                      className={filter === filterType ? 'primary-gradient' : ''}
                    >
                      {filterType === 'all' ? 'All' : 
                       filterType === 'todo' ? 'To Do' : 
                       filterType === 'inprogress' ? 'In Progress' : 'Completed'}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task List */}
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const config = DIFFICULTY_CONFIG[task.difficulty];
              return (
                <Card key={task.id} className={`glass-card transition-all duration-300 ${
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
                            {task.isDefault && (
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
                              onClick={() => startTask(task.id)}
                            >
                              <Play className="h-3 w-3" />
                              Start
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteTask(task.id)}
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
                              onClick={() => completeTask(task.id)}
                            >
                              <CheckCircle className="h-3 w-3" />
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteTask(task.id)}
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
                              onClick={() => revertTask(task.id)}
                            >
                              <RotateCcw className="h-3 w-3" />
                              Revert
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteTask(task.id)}
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
        </div>

        {/* Achievements and Stats */}
        <div className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {TIER_BADGES.map((tier) => {
                const isUnlocked = playerStats.totalXP >= tier.minXP;
                return (
                  <div
                    key={tier.name}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      isUnlocked ? 'bg-secondary/20' : 'bg-muted/10'
                    } ${isUnlocked ? 'animate-pulse-glow' : ''}`}
                  >
                    <span className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}>
                      {tier.icon}
                    </span>
                    <div className="flex-1">
                      <p className={`font-medium ${isUnlocked ? tier.color : 'text-muted-foreground'}`}>
                        {tier.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tier.minXP} XP required
                      </p>
                    </div>
                    {isUnlocked && (
                      <Badge variant="default" className="bg-green-600">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

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
                <span className="font-medium text-green-400">{tasks.filter(t => t.state === 'completed').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">In Progress</span>
                <span className="font-medium text-blue-400">{tasks.filter(t => t.state === 'inprogress').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Missed</span>
                <span className="font-medium text-red-400">{tasks.filter(t => t.state === 'missed').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="font-medium">
                  {tasks.length > 0 ? Math.round((tasks.filter(t => t.state === 'completed').length / tasks.length) * 100) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
