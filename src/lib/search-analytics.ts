interface SearchEvent {
  timestamp: Date;
  query: string;
  filters: Record<string, any>;
  resultCount: number;
  responseTime: number;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
}

interface PopularSearch {
  query: string;
  count: number;
  lastSearched: Date;
}

interface SearchSuggestion {
  query: string;
  count: number;
  score: number;
}

class SearchAnalytics {
  private searches: SearchEvent[] = [];
  private readonly maxSearches = 10000;
  private popularSearches = new Map<string, PopularSearch>();

  logSearch(event: Omit<SearchEvent, 'timestamp'>): void {
    const searchEvent: SearchEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.searches.push(searchEvent);

    if (this.searches.length > this.maxSearches) {
      this.searches.shift();
    }

    // Update popular searches
    if (event.query && event.query.trim().length > 0) {
      const normalizedQuery = event.query.toLowerCase().trim();
      const existing = this.popularSearches.get(normalizedQuery);
      
      if (existing) {
        existing.count++;
        existing.lastSearched = new Date();
      } else {
        this.popularSearches.set(normalizedQuery, {
          query: normalizedQuery,
          count: 1,
          lastSearched: new Date(),
        });
      }
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Search] "${event.query}" -> ${event.resultCount} results (${event.responseTime}ms)`);
    }
  }

  getRecentSearches(limit = 100): SearchEvent[] {
    return this.searches.slice(-limit);
  }

  getPopularSearches(limit = 20): PopularSearch[] {
    return Array.from(this.popularSearches.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getSearchSuggestions(prefix: string, limit = 10): SearchSuggestion[] {
    const normalizedPrefix = prefix.toLowerCase().trim();
    if (normalizedPrefix.length < 2) return [];

    const suggestions: SearchSuggestion[] = [];
    
    for (const [query, data] of Array.from(this.popularSearches.entries())) {
      if (query.includes(normalizedPrefix)) {
        // Simple scoring: frequency * recency factor
        const recencyFactor = this.getRecencyFactor(data.lastSearched);
        const score = data.count * recencyFactor;
        
        suggestions.push({
          query: data.query,
          count: data.count,
          score,
        });
      }
    }

    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private getRecencyFactor(date: Date): number {
    const now = Date.now();
    const searchTime = date.getTime();
    const hoursSince = (now - searchTime) / (1000 * 60 * 60);
    
    // Decay factor: 1.0 for recent searches, decreasing over time
    return Math.max(0.1, Math.exp(-hoursSince / 24)); // 24-hour half-life
  }

  getSearchStats(timeRange?: { start: Date; end: Date }) {
    let relevantSearches = this.searches;
    
    if (timeRange) {
      relevantSearches = this.searches.filter(search => 
        search.timestamp >= timeRange.start && search.timestamp <= timeRange.end
      );
    }

    const totalSearches = relevantSearches.length;
    const uniqueQueries = new Set(relevantSearches.map(s => s.query.toLowerCase().trim())).size;
    
    const avgResponseTime = totalSearches > 0 
      ? relevantSearches.reduce((sum, s) => sum + s.responseTime, 0) / totalSearches 
      : 0;
    
    const avgResultCount = totalSearches > 0
      ? relevantSearches.reduce((sum, s) => sum + s.resultCount, 0) / totalSearches
      : 0;

    const zeroResultSearches = relevantSearches.filter(s => s.resultCount === 0).length;
    const zeroResultRate = totalSearches > 0 ? (zeroResultSearches / totalSearches) * 100 : 0;

    // Get most common filters
    const filterUsage = new Map<string, number>();
    relevantSearches.forEach(search => {
      Object.keys(search.filters).forEach(filter => {
        if (search.filters[filter] !== undefined && search.filters[filter] !== null) {
          filterUsage.set(filter, (filterUsage.get(filter) || 0) + 1);
        }
      });
    });

    const topFilters = Array.from(filterUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([filter, count]) => ({ filter, count }));

    return {
      totalSearches,
      uniqueQueries,
      averageResponseTime: Math.round(avgResponseTime),
      averageResultCount: Math.round(avgResultCount * 10) / 10,
      zeroResultRate: Math.round(zeroResultRate * 10) / 10,
      topFilters,
    };
  }

  getSearchTrends(hours = 24): Array<{ hour: string; count: number; avgResponseTime: number }> {
    const now = new Date();
    const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
    
    const trends: Array<{ hour: string; count: number; avgResponseTime: number }> = [];
    
    for (let i = 0; i < hours; i++) {
      const hourStart = new Date(startTime.getTime() + i * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
      
      const hourSearches = this.searches.filter(search => 
        search.timestamp >= hourStart && search.timestamp < hourEnd
      );
      
      const avgResponseTime = hourSearches.length > 0
        ? hourSearches.reduce((sum, s) => sum + s.responseTime, 0) / hourSearches.length
        : 0;
      
      trends.push({
        hour: hourStart.toISOString().substring(0, 13) + ':00',
        count: hourSearches.length,
        avgResponseTime: Math.round(avgResponseTime),
      });
    }
    
    return trends;
  }

  clear(): void {
    this.searches = [];
    this.popularSearches.clear();
  }

  // Clean up old data to prevent memory leaks
  cleanup(maxAge = 7 * 24 * 60 * 60 * 1000): void { // 7 days default
    const cutoff = new Date(Date.now() - maxAge);
    
    // Remove old searches
    this.searches = this.searches.filter(search => search.timestamp > cutoff);
    
    // Remove old popular searches
    for (const [query, data] of Array.from(this.popularSearches.entries())) {
      if (data.lastSearched < cutoff) {
        this.popularSearches.delete(query);
      }
    }
  }
}

export const searchAnalytics = new SearchAnalytics();

// Auto-cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    searchAnalytics.cleanup();
  }, 60 * 60 * 1000);
}

export type { SearchEvent, PopularSearch, SearchSuggestion };