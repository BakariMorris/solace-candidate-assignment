"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Search, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { searchAnalytics } from "../lib/search-analytics";

interface TrendingSearchesProps {
  onSearchSelect?: (query: string) => void;
  className?: string;
}

export default function TrendingSearches({ onSearchSelect, className = "" }: TrendingSearchesProps) {
  const [popularSearches, setPopularSearches] = useState<any[]>([]);
  const [searchStats, setSearchStats] = useState<any>(null);

  useEffect(() => {
    // Update trending searches every 30 seconds
    const updateData = () => {
      const popular = searchAnalytics.getPopularSearches(8);
      const stats = searchAnalytics.getSearchStats();
      
      setPopularSearches(popular);
      setSearchStats(stats);
    };

    updateData();
    const interval = setInterval(updateData, 30000);

    return () => clearInterval(interval);
  }, []);

  if (popularSearches.length === 0) {
    return null;
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-h4">
          <TrendingUp className="h-5 w-5 text-primary" />
          Trending Searches
        </CardTitle>
        {searchStats && (
          <div className="flex flex-wrap gap-2 text-caption text-muted-foreground">
            <span>{searchStats.totalSearches} total searches</span>
            <span>•</span>
            <span>{searchStats.uniqueQueries} unique queries</span>
            {searchStats.averageResponseTime && (
              <>
                <span>•</span>
                <span>{searchStats.averageResponseTime}ms avg response</span>
              </>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {popularSearches.slice(0, 6).map((search, index) => (
            <Button
              key={search.query}
              variant="ghost"
              className="h-auto p-3 justify-start text-left"
              onClick={() => onSearchSelect?.(search.query)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                    index < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <Search className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="truncate text-body-sm">{search.query}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {search.count}
                </Badge>
              </div>
            </Button>
          ))}
        </div>

        {popularSearches.length > 6 && (
          <div className="pt-2 border-t">
            <div className="flex flex-wrap gap-1">
              {popularSearches.slice(6).map((search) => (
                <Button
                  key={search.query}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onSearchSelect?.(search.query)}
                >
                  {search.query}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {search.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="flex items-center gap-1 text-caption text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Updates every 30 seconds</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}