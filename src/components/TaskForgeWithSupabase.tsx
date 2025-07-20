import React, { useState } from 'react';
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
  LogOut
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useSupabaseAuth';
import { useTaskForge } from '@/hooks/useTaskForge';
import { RealTimeClock } from './RealTimeClock';
import React, { Suspense } from 'react';
const StickerSystem = React.lazy(() => import('./StickerSystem'));
import { CelebrationModal } from './CelebrationModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const TIER_BADGES = [
  { name: 'Bronze', minXP: 0, color: 'text-bronze', icon: '🥉' },
  { name: 'Silver', minXP: 100, color: 'text-silver', icon: '🥈' },
  { name: 'Gold', minXP: 300, color: 'text-gold', icon: '🥇' },
  { name: 'Platinum', minXP: 600, color: 'text-platinum', icon: '💎' },
  { name: 'Ultra', minXP: 1000, color: 'text-ultra', icon: '⭐' }
];

export const TaskForgeWithSupabase: React.FC = () => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newTaskDifficulty, setNewTaskDifficulty] = useState<'easy' | 'medium' | 'hard' | 'boss'>('easy');
  const [filter, setFilter] = useState<'all' | 'todo' | 'inprogress' | 'completed'>('all');
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const {
    tasks,
    playerStats,
    unlockedStickers,
    celebrationData,
    setCelebrationData,
    loading,
    createTask,
    deleteTask,
    startTask,
    completeTask,
    revertTask,
    DIFFICULTY_CONFIG
  } = useTaskForge();
  const { toast } = useToast();

  const addTask = () => {
    if (!newTaskTitle.trim() || !newTaskCategory.trim()) return;

    createTask({
      title: newTaskTitle,
      category: newTaskCategory,
      difficulty: newTaskDifficulty,
      state: 'todo',
      is_default: false
    });

    setNewTaskTitle('');
    setNewTaskCategory('');
  };

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

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.state === filter;
  });

  const getCurrentTier = () => {
    if (!playerStats) return TIER_BADGES[0];
    return TIER_BADGES.slice().reverse().find(tier => playerStats.total_xp >= tier.minXP) || TIER_BADGES[0];
  };

  const getNextTier = () => {
    if (!playerStats) return TIER_BADGES[1];
    return TIER_BADGES.find(tier => playerStats.total_xp < tier.minXP);
  };

  const saveProgress = async () => {
    if (!user) return;
    let errorMsg = '';
    // Save playerStats
    const { error: statsError } = await supabase
      .from('player_stats')
      .upsert([
        {
          user_id: user.id,
          total_xp: playerStats.total_xp,
          coins: playerStats.coins,
          level: playerStats.level,
          streak: playerStats.streak,
          last_completed_date: playerStats.last_completed_date,
          // add other fields as needed
        }
      ], { onConflict: ['user_id'] });
    if (statsError) errorMsg += 'Stats: ' + statsError.message + ' ';

    // Save tasks
    const { error: tasksError } = await supabase
      .from('tasks')
      .upsert(tasks.map(task => ({ ...task, user_id: user.id })), { onConflict: ['id'] });
    if (tasksError) errorMsg += 'Tasks: ' + tasksError.message;

    if (errorMsg) {
      toast({ title: 'Save Failed', description: errorMsg, variant: 'destructive' });
    } else {
      toast({ title: 'Progress Saved!', description: 'Your progress has been saved to the cloud.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading TaskForge...</p>
        </div>
      </div>
    );
  }

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const progressToNext = nextTier && playerStats
    ? ((playerStats.total_xp - currentTier.minXP) / (nextTier.minXP - currentTier.minXP)) * 100
    : 100;

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={celebrationData.isOpen}
        onClose={() => setCelebrationData(prev => ({ ...prev, isOpen: false }))}
        quote={celebrationData.quote}
        xpGained={celebrationData.xpGained}
        coinsGained={celebrationData.coinsGained}
        taskTitle={celebrationData.taskTitle}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            TaskForge
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.email}! Ready to level up?
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
          
          <Button onClick={signOut} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
          <Button onClick={saveProgress} variant="outline">Save Progress</Button>
        </div>
      </div>

      {/* Stats Cards */}
      {playerStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="p-2 rounded-full xp-gradient">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Level {playerStats.level}</p>
                <p className="text-2xl font-bold text-xp">{playerStats.total_xp} XP</p>
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
      )}

      {/* Progress to Next Tier */}
      {nextTier && playerStats && (
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Progress to {nextTier.name} {nextTier.icon}
              </span>
              <span className="text-sm text-muted-foreground">
                {playerStats.total_xp}/{nextTier.minXP} XP
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

        {/* Stickers and Stats */}
        <div className="space-y-4">
          <Suspense fallback={<div>Loading stickers...</div>}>
            <StickerSystem 
              userLevel={playerStats?.level || 1} 
              unlockedStickers={unlockedStickers} 
            />
          </Suspense>

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
