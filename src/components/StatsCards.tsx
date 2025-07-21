
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Coins, Trophy, Calendar } from 'lucide-react';
import { PlayerStats } from '@/hooks/useTaskForge';

interface StatsCardsProps {
  playerStats: PlayerStats;
  currentTier: {
    name: string;
    color: string;
    icon: string;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ playerStats, currentTier }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      <Card className="glass-card">
        <CardContent className="p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3">
          <div className="p-1.5 sm:p-2 rounded-full xp-gradient flex-shrink-0">
            <Zap className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              Level {playerStats.level}
            </p>
            <p className="text-lg sm:text-2xl font-bold text-xp truncate">
              {playerStats.total_xp} XP
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3">
          <div className="p-1.5 sm:p-2 rounded-full coin-gradient flex-shrink-0">
            <Coins className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground truncate">Coins</p>
            <p className="text-lg sm:text-2xl font-bold text-coin truncate">
              {playerStats.coins}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3">
          <div className="p-1.5 sm:p-2 rounded-full primary-gradient flex-shrink-0">
            <Trophy className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground truncate">Tier</p>
            <p className={`text-sm sm:text-xl font-bold ${currentTier.color} truncate`}>
              {currentTier.icon} {currentTier.name}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3">
          <div className="p-1.5 sm:p-2 rounded-full bg-destructive flex-shrink-0">
            <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground truncate">Streak</p>
            <p className="text-lg sm:text-2xl font-bold text-destructive truncate">
              {playerStats.streak} days
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
