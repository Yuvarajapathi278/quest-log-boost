
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const RealTimeClock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <div className="flex flex-col">
        <span className="font-medium">{formatTime(currentTime)}</span>
        <span className="text-xs text-muted-foreground">{formatDate(currentTime)}</span>
      </div>
    </div>
  );
};
