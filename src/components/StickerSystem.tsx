
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { STICKER_COLLECTION, Sticker } from "./sticker-collection";

interface StickerSystemProps {
  userLevel: number;
  unlockedStickers: string[];
}

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

export const StickerSystem: React.FC<StickerSystemProps> = React.memo(({ userLevel, unlockedStickers }) => {
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
});
