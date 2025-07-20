export interface Sticker {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockCondition: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  levelRequired: number;
  category: 'naruto' | 'dragonball' | 'solo_leveling' | 'dragons' | 'misc';
}

export const STICKER_COLLECTION: Sticker[] = [
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