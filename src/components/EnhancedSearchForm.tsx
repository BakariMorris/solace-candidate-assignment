"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { useSearchStore } from "../store/useSearchStore";

interface SearchSuggestion {
  text: string;
  type: 'recent' | 'trending' | 'suggestion';
  count?: number;
}

interface EnhancedSearchFormProps {
  onSearch: (term: string) => void;
}

export default function EnhancedSearchForm({ onSearch }: EnhancedSearchFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [inputValue, setInputValue] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    searchTerm, 
    recentSearches, 
    clearRecentSearches,
    addRecentSearch 
  } = useSearchStore();

  // Fetch search suggestions from API
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch('/api/analytics?action=suggestions');
        const data = await response.json();
        
        const combinedSuggestions: SearchSuggestion[] = [
          ...recentSearches.slice(0, 3).map(term => ({ text: term, type: 'recent' as const })),
          ...data.suggestions?.slice(0, 5).map((item: any) => ({ 
            text: item.term, 
            type: 'trending' as const, 
            count: item.count 
          })) || []
        ];
        
        setSuggestions(combinedSuggestions);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        // Fallback to recent searches only
        setSuggestions(recentSearches.slice(0, 5).map(term => ({ text: term, type: 'recent' })));
      }
    };

    if (isOpen) {
      fetchSuggestions();
    }
  }, [isOpen, recentSearches]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    onSearch(value);
    setIsOpen(value.length > 0 || suggestions.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onSearch(suggestion);
    addRecentSearch(suggestion);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue);
      addRecentSearch(inputValue);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearInput = () => {
    setInputValue("");
    onSearch("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.text.toLowerCase().includes(inputValue.toLowerCase()) &&
    suggestion.text.toLowerCase() !== inputValue.toLowerCase()
  );

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search advocates by name, specialty, location..."
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="pl-10 pr-10 h-12 text-body border-2 focus:border-primary/50"
          />
          {inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearInput}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {isOpen && (filteredSuggestions.length > 0 || recentSearches.length > 0) && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 card-elevated">
          <CardContent className="p-4">
            {filteredSuggestions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-body-sm font-semibold text-muted-foreground">
                    Suggestions
                  </h4>
                </div>
                {filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.type}-${index}`}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      {suggestion.type === 'recent' ? (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-body">{suggestion.text}</span>
                    </div>
                    {suggestion.count && (
                      <Badge variant="secondary" className="text-caption">
                        {suggestion.count}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {recentSearches.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-body-sm font-semibold text-muted-foreground">
                    Recent Searches
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="text-caption text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.slice(0, 6).map((term, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => handleSuggestionClick(term)}
                    >
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}