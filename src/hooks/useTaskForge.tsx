
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { STICKER_COLLECTION } from '@/components/sticker-collection';
import { getDifficultySpecificQuote } from '@/components/MotivationalQuotes';
import confetti from 'canvas-confetti';

export interface Task {
  id: string;
  title: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'boss';
  state: 'todo' | 'inprogress' | 'completed' | 'missed';
  is_default: boolean;
  created_at: string;
  completed_at?: string;
  deadline?: string;
  user_id: string;
  is_daily_timetable?: boolean;
  focus?: string;
}

export interface PlayerStats {
  id: string;
  user_id: string;
  total_xp: number;
  coins: number;
  level: number;
  streak: number;
  last_completed_date?: string;
  last_day_checked?: string;
  created_at: string;
}

export const DIFFICULTY_CONFIG = {
  easy: { xp: 10, coins: 5, color: 'text-green-400', label: 'Easy' },
  medium: { xp: 25, coins: 10, color: 'text-yellow-400', label: 'Medium' },
  hard: { xp: 50, coins: 20, color: 'text-orange-400', label: 'Hard' },
  boss: { xp: 100, coins: 30, color: 'text-purple-400', label: 'Boss' }
};

const DAILY_TIMETABLE = [
  { time: "7:20 – 8:00 AM", activity: "🛌 Wake up + Clean Up", focus: "No phone. Hydrate. Touch grass (or desk).", difficulty: 'easy' },
  { time: "8:00 – 8:20 AM", activity: "🍽️ Breakfast + Brain Prep", focus: "Listen to podcast (Tech/CS/Atomic Habits style)", difficulty: 'easy' },
  { time: "8:20 – 9:20 AM", activity: "⚡ Light DSA / Revision (optional)", focus: "1 problem or 1 concept — just 30 mins to warm up", difficulty: 'medium' },
  { time: "9:30 – 5:00 PM", activity: "👨‍💻 Office Hours", focus: "Work + Save mental energy (no burnout)", difficulty: 'medium' },
  { time: "5:00 – 6:00 PM", activity: "😴 Nap / Rest Mode", focus: "Your body's power hour. No guilt. Energy bank.", difficulty: 'easy' },
  { time: "6:00 – 7:30 PM", activity: "🔥 DSA GRIND MODE", focus: "NeetCode or topic grind (1–2 problems/day)", difficulty: 'hard' },
  { time: "7:30 – 8:00 PM", activity: "🚀 System Design Concepts", focus: "1 concept/day (watch + journal)", difficulty: 'medium' },
  { time: "8:00 – 8:30 PM", activity: "🍽️ Dinner + Chill", focus: "Light YouTube, music, walk — no code", difficulty: 'easy' },
  { time: "8:30 – 10:15 PM", activity: "📱 Flutter Project Grind", focus: "Build your app → resume value + GitHub juice", difficulty: 'hard' },
  { time: "10:15 – 11:30 PM", activity: "🧠 Mock / Review / Interview Prep", focus: "Solve 1 mock DSA Q OR review past topics", difficulty: 'medium' },
  { time: "11:30 – 12:30 AM", activity: "🧘 Wind down + Rituals", focus: "Read 5 pages, stretch, light journaling", difficulty: 'easy' },
  { time: "1:00 AM – 7:20 AM", activity: "😴 Sleep Mode", focus: "Let the brain defrag & reboot", difficulty: 'easy' }
];

export const useTaskForge = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [celebrationData, setCelebrationData] = useState<{
    isOpen: boolean;
    quote: any;
    xpGained: number;
    coinsGained: number;
    taskTitle: string;
  }>({
    isOpen: false,
    quote: null,
    xpGained: 0,
    coinsGained: 0,
    taskTitle: ''
  });

  // Enhanced fetch tasks with better error handling
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      console.log('🔄 Fetching tasks for user:', user.id);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching tasks:', error);
        throw new Error(`Failed to fetch tasks: ${error.message}`);
      }
      
      console.log('✅ Successfully fetched', data?.length || 0, 'tasks');
      return data as Task[];
    },
    enabled: !!user,
    retry: (failureCount, error) => {
      console.log(`Retry attempt ${failureCount} for tasks:`, error);
      return failureCount < 3;
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Enhanced fetch player stats with better error handling
  const { data: playerStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['player_stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      console.log('🔄 Fetching player stats for user:', user.id);
      
      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('❌ Error fetching player stats:', error);
        throw new Error(`Failed to fetch player stats: ${error.message}`);
      }
      
      if (!data) {
        console.log('📊 No player stats found, creating new ones...');
        const { data: newStats, error: createError } = await supabase
          .from('player_stats')
          .insert([{
            user_id: user.id,
            total_xp: 0,
            coins: 0,
            level: 1,
            streak: 0
          }])
          .select()
          .single();
        
        if (createError) {
          console.error('❌ Error creating player stats:', createError);
          throw new Error(`Failed to create player stats: ${createError.message}`);
        }
        
        console.log('✅ Created new player stats:', newStats);
        return newStats as PlayerStats;
      }
      
      console.log('✅ Successfully fetched player stats');
      return data as PlayerStats;
    },
    enabled: !!user,
    retry: (failureCount, error) => {
      console.log(`Retry attempt ${failureCount} for stats:`, error);
      return failureCount < 3;
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Fetch unlocked stickers
  const { data: unlockedStickers = [] } = useQuery({
    queryKey: ['unlocked_stickers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('unlocked_stickers')
        .select('sticker_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data.map(item => item.sticker_id);
    },
    enabled: !!user,
  });

  // Enhanced create task mutation with reduced toast notifications
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<Task, 'id' | 'created_at' | 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('🆕 Creating new task:', taskData.title);
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, user_id: user.id }])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Create task error:', error);
        throw new Error(`Failed to create task: ${error.message}`);
      }
      
      console.log('✅ Task created successfully');
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // Only show toast for manually created tasks, not daily timetable
      if (!variables.is_daily_timetable) {
        toast({
          title: "🎯 Quest Added!",
          description: "New challenge awaits completion!",
          duration: 2000
        });
      }
    },
    onError: (error: any) => {
      console.error('Create task error:', error);
      toast({
        title: "❌ Failed to Create Quest",
        description: error.message || "Please try again.",
        variant: "destructive",
        duration: 3000
      });
    },
  });

  // Enhanced update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      console.log('🔄 Updating task:', id, updates);
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Update task error:', error);
        throw new Error(`Failed to update task: ${error.message}`);
      }
      
      console.log('✅ Task updated successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      console.error('Update task error:', error);
      toast({
        title: "❌ Failed to Update Quest",
        description: error.message || "Please try again.",
        variant: "destructive",
        duration: 3000
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Quest Removed",
        description: "Task has been deleted from your quest log.",
        duration: 2000
      });
    },
    onError: (error) => {
      console.error('Delete task error:', error);
      toast({
        title: "Failed to Delete Quest",
        description: "Please try again.",
        variant: "destructive",
        duration: 3000
      });
    },
  });

  // Enhanced update player stats mutation
  const updateStatsMutation = useMutation({
    mutationFn: async (updates: Partial<PlayerStats>) => {
      if (!user || !playerStats) throw new Error('User or stats not available');
      
      console.log('📊 Updating player stats:', updates);
      const { data, error } = await supabase
        .from('player_stats')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Update stats error:', error);
        throw new Error(`Failed to update stats: ${error.message}`);
      }
      
      console.log('✅ Player stats updated successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player_stats'] });
    },
    onError: (error: any) => {
      console.error('Update stats error:', error);
      toast({
        title: "❌ Failed to Update Stats",
        description: error.message || "Progress may not be saved.",
        variant: "destructive",
        duration: 3000
      });
    },
  });

  // Unlock sticker mutation
  const unlockStickerMutation = useMutation({
    mutationFn: async (stickerId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('unlocked_stickers')
        .insert([{ user_id: user.id, sticker_id: stickerId }])
        .select()
        .single();
      
      if (error && !error.message.includes('duplicate')) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unlocked_stickers'] });
    },
  });

  // Check for new sticker unlocks
  const checkStickerUnlocks = async (newLevel: number, newXP: number) => {
    if (!user) return;
    
    const eligibleStickers = STICKER_COLLECTION.filter(
      sticker => newLevel >= sticker.levelRequired && !unlockedStickers.includes(sticker.id)
    );

    for (const sticker of eligibleStickers) {
      try {
        await unlockStickerMutation.mutateAsync(sticker.id);
        
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        toast({
          title: `🎉 New Sticker Unlocked!`,
          description: `${sticker.emoji} ${sticker.name} - ${sticker.description}`,
          duration: 3000
        });
      } catch (error) {
        console.log('Sticker already unlocked or error:', error);
      }
    }
  };

  // Add daily timetable tasks on first load and after daily reset
  const addDailyTimetableTasks = async () => {
    if (!user) return;
    
    console.log('🗓️ Adding daily timetable tasks...');
    
    // Check if daily tasks already exist for today
    const today = new Date().toDateString();
    const existingDailyTasks = tasks.filter(task => 
      task.is_daily_timetable && 
      new Date(task.created_at).toDateString() === today
    );

    if (existingDailyTasks.length > 0) {
      console.log('📅 Daily tasks already exist for today');
      return;
    }

    // Create daily timetable tasks
    for (const item of DAILY_TIMETABLE) {
      try {
        await createTaskMutation.mutateAsync({
          title: `${item.time} - ${item.activity}`,
          category: 'Daily Routine',
          difficulty: item.difficulty as 'easy' | 'medium' | 'hard' | 'boss',
          state: 'todo',
          is_default: true,
          is_daily_timetable: true,
          focus: item.focus
        });
      } catch (error) {
        console.error('Failed to create daily task:', error);
      }
    }
  };

  // Daily reset logic at 2:30 AM - only for timetable tasks
  useEffect(() => {
    if (!user) return;
    
    const checkDailyReset = async () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 2, 30, 0, 0);
      let lastReset = localStorage.getItem('lastDailyReset');
      let lastResetDate = lastReset ? new Date(lastReset) : null;
      
      if (!lastResetDate || (now > today && (!lastResetDate || lastResetDate < today))) {
        console.log('🔄 Daily reset triggered - removing old timetable tasks');
        
        // Remove only daily timetable tasks
        const dailyTasks = tasks.filter(task => task.is_daily_timetable);
        for (const task of dailyTasks) {
          try {
            await supabase.from('tasks').delete().eq('id', task.id);
          } catch (error) {
            console.error('Error removing daily task:', error);
          }
        }
        
        // Refetch tasks and add new daily tasks
        await queryClient.invalidateQueries({ queryKey: ['tasks'] });
        setTimeout(() => addDailyTimetableTasks(), 1000);
        
        localStorage.setItem('lastDailyReset', now.toISOString());
      }
    };

    checkDailyReset();
    const interval = setInterval(checkDailyReset, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user, tasks]);

  // Add daily tasks on first load
  useEffect(() => {
    if (user && tasks.length >= 0) {
      const dailyTasksExist = tasks.some(task => task.is_daily_timetable);
      if (!dailyTasksExist) {
        addDailyTimetableTasks();
      }
    }
  }, [user, tasks]);

  // Complete task function with motivational quotes
  const completeTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.state !== 'inprogress' || !playerStats) return;

    const config = DIFFICULTY_CONFIG[task.difficulty] || DIFFICULTY_CONFIG['easy'];
    const newXP = playerStats.total_xp + config.xp;
    const newCoins = playerStats.coins + config.coins;
    const newLevel = Math.floor(newXP / 100) + 1;
    
    try {
      console.log('🎯 Completing task:', task.title);
      
      // Update task
      await updateTaskMutation.mutateAsync({
        id: taskId,
        updates: { state: 'completed', completed_at: new Date().toISOString() }
      });

      // Update stats
      const today = new Date();
      const completedToday = tasks.some(t => 
        t.state === 'completed' && 
        t.completed_at && 
        new Date(t.completed_at).toDateString() === today.toDateString()
      );

      await updateStatsMutation.mutateAsync({
        total_xp: newXP,
        coins: newCoins,
        level: newLevel,
        streak: completedToday ? playerStats.streak : playerStats.streak + 1,
        last_completed_date: today.toISOString()
      });

      // Check for level up
      if (newLevel > playerStats.level) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        toast({
          title: `🎉 Level Up! Level ${newLevel}`,
          description: `You've gained incredible power!`,
          duration: 4000
        });

        // Check for new stickers
        await checkStickerUnlocks(newLevel, newXP);
      }

      // Get motivational quote and show celebration
      const quote = getDifficultySpecificQuote(task.difficulty);
      setCelebrationData({
        isOpen: true,
        quote,
        xpGained: config.xp,
        coinsGained: config.coins,
        taskTitle: task.title
      });

      // Confetti celebration
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 }
      });
      
      console.log('✅ Task completed successfully');
    } catch (error: any) {
      console.error('❌ Complete task error:', error);
      toast({
        title: "❌ Failed to Complete Quest",
        description: error.message || "Please try again.",
        variant: "destructive",
        duration: 3000
      });
    }
  };

  // Enhanced error logging
  useEffect(() => {
    if (tasksError) {
      console.error('📋 Tasks error:', tasksError);
      toast({
        title: "❌ Error Loading Tasks",
        description: "Please check your connection and try refreshing.",
        variant: "destructive",
        duration: 5000
      });
    }
    if (statsError) {
      console.error('📊 Stats error:', statsError);
      toast({
        title: "❌ Error Loading Stats",
        description: "Please check your connection and try refreshing.",
        variant: "destructive",
        duration: 5000
      });
    }
  }, [tasksError, statsError, toast]);

  return {
    tasks: tasks || [],
    playerStats,
    unlockedStickers,
    celebrationData,
    setCelebrationData,
    loading: tasksLoading || statsLoading,
    error: tasksError || statsError,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    completeTask,
    startTask: (taskId: string) => updateTaskMutation.mutate({
      id: taskId,
      updates: { state: 'inprogress' }
    }),
    revertTask: async (taskId: string) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task || task.state !== 'completed' || !playerStats) return;

      const config = DIFFICULTY_CONFIG[task.difficulty];
      
      try {
        console.log('↩️ Reverting task:', task.title);
        
        await updateTaskMutation.mutateAsync({
          id: taskId,
          updates: { state: 'todo', completed_at: null }
        });

        await updateStatsMutation.mutateAsync({
          total_xp: Math.max(0, playerStats.total_xp - config.xp),
          coins: Math.max(0, playerStats.coins - config.coins)
        });

        toast({
          title: "↩️ Quest Reverted",
          description: `Task moved back to To Do. -${config.xp} XP, -${config.coins} coins.`,
          duration: 2000
        });
        
        console.log('✅ Task reverted successfully');
      } catch (error: any) {
        console.error('❌ Revert task error:', error);
        toast({
          title: "❌ Failed to Revert Quest",
          description: error.message || "Please try again.",
          variant: "destructive",
          duration: 3000
        });
      }
    }
  };
};
