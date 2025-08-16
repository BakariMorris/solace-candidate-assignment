"use client";

import { Grid, List, ArrowUpDown, Star, MapPin, Calendar, User } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

export type ViewMode = 'grid' | 'list';
export type SortOption = 'relevance' | 'rating' | 'experience' | 'location' | 'name';
export type SortDirection = 'asc' | 'desc';

interface ViewControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortOption;
  sortDirection: SortDirection;
  onSortChange: (option: SortOption, direction: SortDirection) => void;
  totalCount: number;
  isLoading?: boolean;
}

export default function ViewControls({
  viewMode,
  onViewModeChange,
  sortBy,
  sortDirection,
  onSortChange,
  totalCount,
  isLoading = false
}: ViewControlsProps) {
  const sortOptions: { key: SortOption; label: string; icon: any }[] = [
    { key: 'relevance', label: 'Relevance', icon: ArrowUpDown },
    { key: 'rating', label: 'Rating', icon: Star },
    { key: 'experience', label: 'Experience', icon: Calendar },
    { key: 'location', label: 'Location', icon: MapPin },
    { key: 'name', label: 'Name', icon: User },
  ];

  const handleSortClick = (option: SortOption) => {
    if (sortBy === option) {
      // Toggle direction if same option
      onSortChange(option, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new option with default direction
      const defaultDirection = option === 'name' || option === 'location' ? 'asc' : 'desc';
      onSortChange(option, defaultDirection);
    }
  };

  return (
    <div className="flex items-center justify-between py-4">
      {/* Results count */}
      <div className="flex items-center space-x-4">
        <div className="text-body text-muted-foreground">
          {isLoading ? (
            <span>Loading...</span>
          ) : (
            <span>
              {totalCount.toLocaleString()} advocate{totalCount !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        {/* Sort Options */}
        <div className="flex items-center space-x-2">
          <span className="text-body-sm text-muted-foreground">Sort by:</span>
          <div className="flex items-center space-x-1">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              const isActive = sortBy === option.key;
              
              return (
                <Button
                  key={option.key}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleSortClick(option.key)}
                  className="relative"
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {option.label}
                  {isActive && (
                    <Badge variant="secondary" className="ml-1 px-1 text-xs">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === 'grid' ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="rounded-r-none border-r"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}