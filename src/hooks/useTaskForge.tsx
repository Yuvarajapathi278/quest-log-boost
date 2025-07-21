
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

const DIFFICULTY_CONFIG = {
  easy: { xp: 10, coins: 5, color: 'text-green-400', label: 'Easy' },
  medium: { xp: 25, coins: 10, color: 'text-yellow-400', label: 'Medium' },
  hard: { xp: 50, coins: 20, color: 'text-orange-400', label: 'Hard' },
  boss: { xp: 100, coins: 30, color: 'text-purple-400', label: 'Boss' }
};

const DEFAULT_ROUTINES = [
  { title: 'DSA Practice', category: 'Coding', difficulty: 'medium' as const },
  { title: 'Flutter Dev', category: 'Development', difficulty: 'hard' as const },
  { title: 'System Design Review', category: 'Learning', difficulty: 'medium' as const },
  { title: 'Brain Detox', category: 'Wellness', difficulty: 'easy' as const }
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

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      console.log('Fetching tasks for user:', user.id);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
      console.log('Fetched tasks:', data?.length);
      return data as Task[];
    },
    enabled: !!user,
    retry: 3,
    staleTime: 30000,
  });

  // Fetch player stats
  const { data: playerStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['player_stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      console.log('Fetching player stats for user:', user.id);
      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching player stats:', error);
        throw error;
      }
      
      // If no stats exist, create them
      if (!data) {
        console.log('No player stats found, creating new ones...');
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
          console.error('Error creating player stats:', createError);
          throw createError;
        }
        console.log('Created new player stats:', newStats);
        return newStats as PlayerStats;
      }
      
      console.log('Fetched player stats:', data);
      return data as PlayerStats;
    },
    enabled: !!user,
    retry: 3,
    staleTime: 30000,
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

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<Task, 'id' | 'created_at' | 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Quest Added!",
        description: "New challenge awaits completion!",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
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
      });
    },
  });

  // Update player stats mutation
  const updateStatsMutation = useMutation({
    mutationFn: async (updates: Partial<PlayerStats>) => {
      if (!user || !playerStats) throw new Error('User or stats not available');
      
      const { data, error } = await supabase
        .from('player_stats')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player_stats'] });
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
        });
      } catch (error) {
        console.log('Sticker already unlocked or error:', error);
      }
    }
  };

  // Complete task function with motivational quotes
  const completeTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.state !== 'inprogress' || !playerStats) return;

    const config = DIFFICULTY_CONFIG[task.difficulty];
    const newXP = playerStats.total_xp + config.xp;
    const newCoins = playerStats.coins + config.coins;
    const newLevel = Math.floor(newXP / 100) + 1;
    
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
  };

  // Generate daily routines
  useEffect(() => {
    if (!user || !tasks) return;
    
    const today = new Date().toDateString();
    const lastDefaultsAdded = localStorage.getItem('lastDefaultsAddedDate');
    if (lastDefaultsAdded === today) return;

    const hasDefaultsForToday = tasks.some(task => 
      task.is_default && new Date(task.created_at).toDateString() === today
    );

    if (!hasDefaultsForToday) {
      DEFAULT_ROUTINES.forEach(routine => {
        createTaskMutation.mutate({
          title: routine.title,
          category: routine.category,
          difficulty: routine.difficulty,
          state: 'todo',
          is_default: true,
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
      });
      localStorage.setItem('lastDefaultsAddedDate', today);
    }
  }, [user, tasks]);

  // Log errors for debugging
  useEffect(() => {
    if (tasksError) {
      console.error('Tasks error:', tasksError);
      toast({
        title: "Error Loading Tasks",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    }
    if (statsError) {
      console.error('Stats error:', statsError);
      toast({
        title: "Error Loading Stats",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    }
  }, [tasksError, statsError, toast]);

  return {
    tasks,
    playerStats,
    unlockedStickers,
    celebrationData,
    setCelebrationData,
    loading: tasksLoading || statsLoading,
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
      
      await updateTaskMutation.mutateAsync({
        id: taskId,
        updates: { state: 'todo', completed_at: null }
      });

      await updateStatsMutation.mutateAsync({
        total_xp: Math.max(0, playerStats.total_xp - config.xp),
        coins: Math.max(0, playerStats.coins - config.coins)
      });

      toast({
        title: "Quest Reverted",
        description: `Task moved back to To Do. -${config.xp} XP, -${config.coins} coins.`,
      });
    },
    DIFFICULTY_CONFIG
  };
};
