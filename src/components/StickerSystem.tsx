
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Sticker {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockCondition: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  levelRequired: number;
  category: 'naruto' | 'dragonball' | 'solo_leveling' | 'dragons' | 'misc';
}

interface StickerSystemProps {
  userLevel: number;
  unlockedStickers: string[];
}

const STICKER_COLLECTION: Sticker[] = [
  // Basic/Common (Level 1-5)
  { id: 'kunai', name: 'Kunai', emoji: '🗡️', description: 'Basic ninja tool', unlockCondition: 'Complete first task', rarity: 'common', levelRequired: 1, category: 'naruto' },
  { id: 'shuriken', name: 'Shuriken', emoji: '⭐', description: 'Throwing star', unlockCondition: 'Complete 3 tasks', rarity: 'common', levelRequired: 2, category: 'naruto' },
  { id: 'baby_dragon', name: 'Baby Dragon', emoji: '🐉', description: 'Your first dragon companion', unlockCondition: 'Reach level 3', rarity: 'common', levelRequired: 3, category: 'dragons' },
  
  // Rare (Level 6-15)
  { id: 'naruto', name: 'Naruto Uzumaki', emoji: '🍥', description: 'The knucklehead ninja!', unlockCondition: 'Reach level 6', rarity: 'rare', levelRequired: 6, category: 'naruto' },
  { id: 'goku', name: 'Son Goku', emoji: '🥋', description: 'The legendary Saiyan warrior', unlockCondition: 'Reach level 8', rarity: 'rare', levelRequired: 8, category: 'dragonball' },
  { id: 'fire_dragon', name: 'Fire Dragon', emoji: '🔥', description: 'Breathes flames of determination', unlockCondition: 'Complete 10 hard tasks', rarity: 'rare', levelRequired: 10, category: 'dragons' },
  { id: 'sasuke', name: 'Sasuke Uchiha', emoji: '⚡', description: 'The last Uchiha', unlockCondition: 'Reach level 12', rarity: 'rare', levelRequired: 12, category: 'naruto' },
  { id: 'vegeta', name: 'Vegeta', emoji: '👑', description: 'The Prince of all Saiyans', unlockCondition: 'Reach level 15', rarity: 'rare', levelRequired: 15, category: 'dragonball' },
  
  // Epic (Level 16-30)
  { id: 'kakashi', name: 'Kakashi Hatake', emoji: '📖', description: 'The Copy Ninja', unlockCondition: 'Reach level 18', rarity: 'epic', levelRequired: 18, category: 'naruto' },
  { id: 'super_saiyan', name: 'Super Saiyan', emoji: '⚡', description: 'The legendary transformation', unlockCondition: 'Reach level 20', rarity: 'epic', levelRequired: 20, category: 'dragonball' },
  { id: 'sung_jinwoo', name: 'Sung Jin-Woo', emoji: '🗡️', description: 'The Shadow Monarch rises', unlockCondition: 'Reach level 25', rarity: 'epic', levelRequired: 25, category: 'solo_leveling' },
  { id: 'ice_dragon', name: 'Ice Dragon', emoji: '❄️', description: 'Master of frozen domains', unlockCondition: 'Complete 50 tasks', rarity: 'epic', levelRequired: 22, category: 'dragons' },
  
  // Legendary (Level 31+)
  { id: 'hokage_naruto', name: 'Hokage Naruto', emoji: '🏮', description: 'The Seventh Hokage', unlockCondition: 'Reach level 35', rarity: 'legendary', levelRequired: 35, category: 'naruto' },
  { id: 'ultra_instinct', name: 'Ultra Instinct Goku', emoji: '🌟', description: 'The ultimate form', unlockCondition: 'Reach level 40', rarity: 'legendary', levelRequired: 40, category: 'dragonball' },
  { id: 'shadow_monarch', name: 'Shadow Monarch', emoji: '👤', description: 'Ruler of the shadows', unlockCondition: 'Reach level 50', rarity: 'legendary', levelRequired: 50, category: 'solo_leveling' },
  { id: 'cosmic_dragon', name: 'Cosmic Dragon', emoji: '🌌', description: 'Guardian of the universe', unlockCondition: 'Reach max level', rarity: 'legendary', levelRequired: 100, category: 'dragons' },
];

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'text-gray-400';
    case 'rare': return 'text-blue-400';
    case 'epic': return 'text-purple-400';
    case 'legendary': return 'text-yellow-400';
    default: return 'text-gray-400';
  }
};

const getRarityBg = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'bg-gray-500/20';
    case 'rare': return 'bg-blue-500/20';
    case 'epic': return 'bg-purple-500/20';
    case 'legendary': return 'bg-yellow-500/20';
    default: return 'bg-gray-500/20';
  }
};

export const StickerSystem: React.FC<StickerSystemProps> = ({ userLevel, unlockedStickers }) => {
  const availableStickers = STICKER_COLLECTION.filter(sticker => userLevel >= sticker.levelRequired);
  const lockedStickers = STICKER_COLLECTION.filter(sticker => userLevel < sticker.levelRequired);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span className="text-2xl">🏆</span>
          <span>Sticker Collection</span>
          <Badge variant="secondary">{unlockedStickers.length}/{STICKER_COLLECTION.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {/* Unlocked Stickers */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-400">✨ Unlocked</h3>
              <div className="grid grid-cols-2 gap-3">
                {availableStickers.map((sticker) => {
                  const isUnlocked = unlockedStickers.includes(sticker.id);
                  return (
                    <div
                      key={sticker.id}
                      className={`p-3 rounded-lg border transition-all ${
                        isUnlocked 
                          ? `${getRarityBg(sticker.rarity)} border-current animate-pulse-glow` 
                          : 'bg-muted/20 border-muted opacity-60'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{sticker.emoji}</div>
                        <div className={`text-sm font-medium ${getRarityColor(sticker.rarity)}`}>
                          {sticker.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {sticker.description}
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`mt-2 text-xs ${getRarityColor(sticker.rarity)}`}
                        >
                          {sticker.rarity}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Locked Stickers Preview */}
            {lockedStickers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-muted-foreground">🔒 Coming Soon</h3>
                <div className="grid grid-cols-2 gap-3">
                  {lockedStickers.slice(0, 6).map((sticker) => (
                    <div
                      key={sticker.id}
                      className="p-3 rounded-lg border border-muted bg-muted/10 opacity-40"
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2 grayscale">❓</div>
                        <div className="text-sm font-medium text-muted-foreground">
                          ???
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Level {sticker.levelRequired} required
                        </div>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {sticker.rarity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export { STICKER_COLLECTION };
export type { Sticker };
