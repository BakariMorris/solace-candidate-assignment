interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };
    
    this.cache.set(key, entry);
    
    // Schedule cleanup
    setTimeout(() => {
      this.delete(key);
    }, entry.ttl);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  size(): number {
    return this.cache.size;
  }

  getStats() {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    const expired = entries.filter(entry => now - entry.timestamp > entry.ttl).length;
    
    return {
      totalEntries: this.cache.size,
      expiredEntries: expired,
      memoryUsage: JSON.stringify(Array.from(this.cache.entries())).length,
    };
  }
}

class CacheManager {
  private cache: InMemoryCache;
  private hits = 0;
  private misses = 0;

  constructor() {
    this.cache = new InMemoryCache();
  }

  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.cache.get<T>(key);
    if (cached !== null) {
      this.hits++;
      return cached;
    }

    // Cache miss - fetch fresh data
    this.misses++;
    const data = await fetchFn();
    this.cache.set(key, data, ttl);
    
    return data;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, data, ttl);
  }

  get<T>(key: string): T | null {
    const result = this.cache.get<T>(key);
    if (result !== null) {
      this.hits++;
    } else {
      this.misses++;
    }
    return result;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  invalidatePattern(pattern: string): void {
    const keys = this.cache.keys();
    const regex = new RegExp(pattern);
    
    keys.forEach(key => {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    });
  }

  getStats() {
    const cacheStats = this.cache.getStats();
    const total = this.hits + this.misses;
    
    return {
      ...cacheStats,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
    };
  }
}

// Create cache instances
export const apiCache = new CacheManager();

// Cache key generators
export const cacheKeys = {
  advocates: (params: Record<string, any>) => {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((obj, key) => {
        obj[key] = params[key];
        return obj;
      }, {} as Record<string, any>);
    
    return `advocates:${JSON.stringify(sortedParams)}`;
  },
  
  advocateCount: (filters: Record<string, any>) => {
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((obj, key) => {
        obj[key] = filters[key];
        return obj;
      }, {} as Record<string, any>);
    
    return `advocates:count:${JSON.stringify(sortedFilters)}`;
  },
  
  searchSuggestions: (term: string) => `search:suggestions:${term.toLowerCase()}`,
  
  popularSearches: () => 'search:popular',
};

// Cache TTL constants (in milliseconds)
export const cacheTTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
};