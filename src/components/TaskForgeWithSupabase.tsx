
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Sun, Moon, LogOut, Save, Smartphone
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
import { useToast } from '@/hooks/use-toast';

const TIER_BADGES = [
  { name: 'Bronze', minXP: 0, color: 'text-bronze', icon: '🥉' },
  { name: 'Silver', minXP: 100, color: 'text-silver', icon: '🥈' },
  { name: 'Gold', minXP: 300, color: 'text-gold', icon: '🥇' },
  { name: 'Platinum', minXP: 600, color: 'text-platinum', icon: '💎' },
  { name: 'Ultra', minXP: 1000, color: 'text-ultra', icon: '⭐' }
];

export const TaskForgeWithSupabase = () => {
  const [filter, setFilter] = useState<'all' | 'todo' | 'inprogress' | 'completed'>('all');
  const [isSaving, setIsSaving] = useState(false);
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
    if (!user || !playerStats || isSaving) return;
    
    setIsSaving(true);
    try {
      console.log('Starting progress save...');
      
      // Save player stats
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

      if (statsError) {
        console.error('Stats save error:', statsError);
        throw new Error(`Failed to save stats: ${statsError.message}`);
      }
      console.log('Stats saved successfully');

      // Save tasks if any exist
      if (tasks.length > 0) {
        const tasksToSave = tasks.map(task => ({ 
          ...task, 
          user_id: user.id 
        }));
        
        const { error: tasksError } = await supabase
          .from('tasks')
          .upsert(tasksToSave, { onConflict: 'id' });

        if (tasksError) {
          console.error('Tasks save error:', tasksError);
          throw new Error(`Failed to save tasks: ${tasksError.message}`);
        }
        console.log('Tasks saved successfully');
      }

      toast({ 
        title: '💾 Progress Saved!', 
        description: 'Your adventure progress has been safely stored in the cloud.',
        duration: 3000
      });
    } catch (error: any) {
      console.error('Save operation failed:', error);
      toast({ 
        title: '❌ Save Failed', 
        description: error.message || 'Unable to save progress. Please try again.', 
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save every 30 seconds
  useState(() => {
    const interval = setInterval(() => {
      if (user && playerStats && !isSaving) {
        saveProgress();
      }
    }, 30000);

    return () => clearInterval(interval);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <div className="text-center space-y-4 p-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <p className="text-lg font-medium">Loading TaskForge...</p>
            <p className="text-sm text-muted-foreground">Preparing your quest adventure...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!playerStats || !tasks) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <div className="text-center space-y-4 p-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg font-medium">Initializing your quest...</p>
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
    <div className="min-h-screen p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <CelebrationModal
        isOpen={celebrationData.isOpen}
        onClose={() => setCelebrationData(prev => ({ ...prev, isOpen: false }))}
        quote={celebrationData.quote}
        xpGained={celebrationData.xpGained}
        coinsGained={celebrationData.coinsGained}
        taskTitle={celebrationData.taskTitle}
      />

      {/* Mobile-Optimized Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
            TaskForge
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 truncate">
            Welcome back, {user?.email?.split('@')[0]}! Ready to level up?
          </p>
          <p className="text-xs text-muted-foreground">
            Crafted with love by Yuvi.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="hidden sm:block">
            <RealTimeClock />
          </div>
          
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
            <Moon className="h-4 w-4" />
          </div>
          
          <Button 
            onClick={saveProgress} 
            variant="outline" 
            size="sm"
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isSaving ? 'Saving...' : 'Save'}
            </span>
          </Button>
          
          <Button onClick={signOut} variant="outline" size="sm" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Mobile Clock for small screens */}
      <div className="sm:hidden flex justify-center">
        <RealTimeClock />
      </div>

      {/* Stats Cards - Mobile Responsive */}
      {playerStats && (
        <StatsCards playerStats={playerStats} currentTier={currentTier} />
      )}

      {/* Progress to Next Tier - Mobile Optimized */}
      {nextTier && playerStats && (
        <Card className="glass-card">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
              <span className="text-xs sm:text-sm text-muted-foreground">
                Progress to {nextTier.name} {nextTier.icon}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {playerStats.total_xp}/{nextTier.minXP} XP
              </span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Main Content - Mobile Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
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

        {/* Stickers and Stats - Mobile Responsive */}
        <div className="space-y-4">
          <StickerSystem 
            userLevel={playerStats?.level || 1} 
            unlockedStickers={unlockedStickers} 
          />
          <QuestStats tasks={tasks} />
        </div>
      </div>

      {/* Mobile Performance Indicator */}
      <div className="sm:hidden fixed bottom-4 right-4 z-50">
        <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-2 border">
          <Smartphone className="h-4 w-4 text-green-500" />
          <span className="text-xs text-muted-foreground">Mobile Ready</span>
        </div>
      </div>
    </div>
  );
};
