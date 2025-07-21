
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface TaskFiltersProps {
  filter: 'all' | 'todo' | 'inprogress' | 'completed';
  onFilterChange: (filter: 'all' | 'todo' | 'inprogress' | 'completed') => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({ filter, onFilterChange }) => {
  const filters = [
    { key: 'all' as const, label: 'All' },
    { key: 'todo' as const, label: 'To Do' },
    { key: 'inprogress' as const, label: 'In Progress' },
    { key: 'completed' as const, label: 'Completed' }
  ];

  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filter:</span>
          <div className="flex space-x-2">
            {filters.map((filterType) => (
              <Button
                key={filterType.key}
                variant={filter === filterType.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange(filterType.key)}
                className={filter === filterType.key ? 'primary-gradient' : ''}
              >
                {filterType.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
