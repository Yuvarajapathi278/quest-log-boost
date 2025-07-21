
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: {
    text: string;
    icon: React.ComponentType<any>;
    color: string;
  };
  xpGained: number;
  coinsGained: number;
  taskTitle: string;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  quote,
  xpGained,
  coinsGained,
  taskTitle
}) => {
  useEffect(() => {
    if (isOpen) {
      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const IconComponent = quote.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <Card className="w-full max-w-md mx-4 glass-card animate-scale-in">
        <CardContent className="p-6 text-center relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="mb-4">
            <div className={`inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 mb-4 animate-pulse`}>
              <IconComponent className={`h-12 w-12 ${quote.color}`} />
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Task Completed!
            </h2>
            
            <p className="text-lg font-medium text-center mb-4">
              "{taskTitle}"
            </p>
            
            <div className={`text-xl font-bold ${quote.color} mb-4 animate-bounce`}>
              {quote.text}
            </div>
            
            <div className="flex justify-center space-x-6 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-xp">+{xpGained}</div>
                <div className="text-sm text-muted-foreground">XP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-coin">+{coinsGained}</div>
                <div className="text-sm text-muted-foreground">Coins</div>
              </div>
            </div>
          </div>
          
          <Button
            onClick={onClose}
            className="w-full primary-gradient"
          >
            Continue Quest
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
