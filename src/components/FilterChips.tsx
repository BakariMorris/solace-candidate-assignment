"use client";

import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface ActiveFilter {
  id: string;
  label: string;
  type: 'search' | 'specialty' | 'location' | 'experience' | 'availability';
}

interface FilterChipsProps {
  activeFilters: ActiveFilter[];
  onRemoveFilter: (filterId: string) => void;
  onClearAll: () => void;
}

export default function FilterChips({ activeFilters, onRemoveFilter, onClearAll }: FilterChipsProps) {
  if (activeFilters.length === 0) {
    return null;
  }

  const getFilterTypeColor = (type: string) => {
    switch (type) {
      case 'search':
        return 'default';
      case 'specialty':
        return 'secondary';
      case 'location':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/30 rounded-lg">
      <span className="text-body-sm font-medium text-muted-foreground">
        Active filters:
      </span>
      
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter) => (
          <Badge
            key={filter.id}
            variant={getFilterTypeColor(filter.type)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-body-sm"
          >
            <span className="max-w-[200px] truncate">{filter.label}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => onRemoveFilter(filter.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>

      {activeFilters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-muted-foreground hover:text-foreground ml-2"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}