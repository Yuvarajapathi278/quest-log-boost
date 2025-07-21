
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
  );
};
