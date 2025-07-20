
import React from 'react';
import { Sparkles, Trophy, Target, Zap, Star, Flame } from 'lucide-react';

export const MOTIVATIONAL_QUOTES = [
  {
    text: "You got it! Awesome work! 🎉",
    icon: Trophy,
    color: "text-yellow-500"
  },
  {
    text: "Incredible! You're on fire! 🔥",
    icon: Flame,
    color: "text-red-500"
  },
  {
    text: "Fantastic job! Keep crushing it! ⚡",
    icon: Zap,
    color: "text-blue-500"
  },
  {
    text: "Outstanding! You're unstoppable! ✨",
    icon: Sparkles,
    color: "text-purple-500"
  },
  {
    text: "Amazing progress! You're leveling up! 🌟",
    icon: Star,
    color: "text-yellow-400"
  },
  {
    text: "Perfect execution! Master warrior! 🎯",
    icon: Target,
    color: "text-green-500"
  },
  {
    text: "Legendary performance! Keep going! 💎",
    icon: Sparkles,
    color: "text-cyan-500"
  },
  {
    text: "You're crushing your goals! Beast mode! 🚀",
    icon: Flame,
    color: "text-orange-500"
  }
];

export const getRandomMotivationalQuote = () => {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
};

export const getDifficultySpecificQuote = (difficulty: string) => {
  const difficultyQuotes = {
    easy: [
      { text: "Nice start! Every journey begins with a single step! 🌱", icon: Target, color: "text-green-400" },
      { text: "Well done! Building momentum! 💪", icon: Zap, color: "text-blue-400" }
    ],
    medium: [
      { text: "Great job! You're getting stronger! 💪", icon: Star, color: "text-yellow-500" },
      { text: "Excellent work! Rising to the challenge! ⚡", icon: Zap, color: "text-blue-500" }
    ],
    hard: [
      { text: "Incredible! You conquered a tough one! 🏆", icon: Trophy, color: "text-yellow-600" },
      { text: "Outstanding! True warrior spirit! 🗡️", icon: Flame, color: "text-red-500" }
    ],
    boss: [
      { text: "LEGENDARY! You defeated the boss! 👑", icon: Trophy, color: "text-purple-600" },
      { text: "EPIC WIN! You're a true champion! 🏆", icon: Sparkles, color: "text-gold" }
    ]
  };

  const quotes = difficultyQuotes[difficulty as keyof typeof difficultyQuotes] || MOTIVATIONAL_QUOTES;
  return quotes[Math.floor(Math.random() * quotes.length)];
};
