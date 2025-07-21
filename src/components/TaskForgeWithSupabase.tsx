
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Sun, Moon, LogOut
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useSupabaseAuth';
import { useTaskForge } from '@/hooks/useTaskForge';
import { RealTimeClock } from './RealTimeClock';
import { StickerSystem } from './StickerSystem';
import { CelebrationModal } from './CelebrationModal';
import { StatsCards } from './StatsCards';
import { TaskCreator } from './TaskCreator';
import { TaskFilters } from './TaskFilters';
import { TaskList } from './TaskList';
import { QuestStats } from './QuestStats';
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
    revertTask
  } = useTaskForge();
  const { toast } = useToast();

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
    if (!user || !playerStats) return;
    
    try {
      const { error: statsError } = await supabase
        .from('player_stats')
        .upsert({
          user_id: user.id,
          total_xp: playerStats.total_xp,
          coins: playerStats.coins,
          level: playerStats.level,
          streak: playerStats.streak,
          last_completed_date: playerStats.last_completed_date,
        }, { onConflict: 'user_id' });

      if (statsError) throw statsError;

      if (tasks.length > 0) {
        const { error: tasksError } = await supabase
          .from('tasks')
          .upsert(
            tasks.map(task => ({ ...task, user_id: user.id })),
            { onConflict: 'id' }
          );

        if (tasksError) throw tasksError;
      }

      toast({ 
        title: 'Progress Saved!', 
        description: 'Your progress has been saved to the cloud.' 
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({ 
        title: 'Save Failed', 
        description: error.message, 
        variant: 'destructive' 
      });
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

  if (!playerStats || !tasks) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Initializing your quest...</p>
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
        <StatsCards playerStats={playerStats} currentTier={currentTier} />
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
          <TaskCreator onCreateTask={createTask} />
          <TaskFilters filter={filter} onFilterChange={setFilter} />
          <TaskList
            tasks={filteredTasks}
            onStartTask={startTask}
            onCompleteTask={completeTask}
            onRevertTask={revertTask}
            onDeleteTask={deleteTask}
          />
        </div>

        {/* Stickers and Stats */}
        <div className="space-y-4">
          <StickerSystem 
            userLevel={playerStats?.level || 1} 
            unlockedStickers={unlockedStickers} 
          />
          <QuestStats tasks={tasks} />
        </div>
      </div>
    </div>
  );
};
