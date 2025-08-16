"use client";

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface PageLoadMetrics {
  navigationStart: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  timeToInteractive?: number;
}

interface ResourceMetrics {
  name: string;
  type: string;
  size: number;
  duration: number;
  timestamp: Date;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private resourceMetrics: ResourceMetrics[] = [];
  private observers: PerformanceObserver[] = [];
  private readonly maxMetrics = 1000;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
      this.trackPageLoad();
    }
  }

  private initializeObservers() {
    try {
      // Track Core Web Vitals
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.recordMetric('LCP', lastEntry.startTime, {
              element: (lastEntry as any).element?.tagName || 'unknown'
            });
          }
        });

        // First Input Delay
        const fidObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach((entry) => {
            this.recordMetric('FID', (entry as any).processingStart - entry.startTime);
          });
        });

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((entryList) => {
          let clsValue = 0;
          entryList.getEntries().forEach((entry) => {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          });
          if (clsValue > 0) {
            this.recordMetric('CLS', clsValue);
          }
        });

        // Resource timing
        const resourceObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach((entry) => {
            if (entry.entryType === 'resource') {
              this.trackResource(entry as PerformanceResourceTiming);
            }
          });
        });

        try {
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          this.observers.push(lcpObserver);
        } catch (e) {
          console.warn('LCP observer not supported');
        }

        try {
          fidObserver.observe({ entryTypes: ['first-input'] });
          this.observers.push(fidObserver);
        } catch (e) {
          console.warn('FID observer not supported');
        }

        try {
          clsObserver.observe({ entryTypes: ['layout-shift'] });
          this.observers.push(clsObserver);
        } catch (e) {
          console.warn('CLS observer not supported');
        }

        try {
          resourceObserver.observe({ entryTypes: ['resource'] });
          this.observers.push(resourceObserver);
        } catch (e) {
          console.warn('Resource observer not supported');
        }
      }
    } catch (error) {
      console.warn('Performance observers not supported:', error);
    }
  }

  private trackPageLoad() {
    if (typeof window === 'undefined') return;

    // Track initial page load metrics
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          this.recordMetric('NavigationStart', navigation.startTime);
          this.recordMetric('DOMContentLoaded', navigation.domContentLoadedEventEnd - navigation.startTime);
          this.recordMetric('LoadComplete', navigation.loadEventEnd - navigation.startTime);
          this.recordMetric('FirstByte', navigation.responseStart - navigation.startTime);
          this.recordMetric('DOMInteractive', navigation.domInteractive - navigation.startTime);
        }

        // Track paint metrics
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach((entry) => {
          this.recordMetric(entry.name, entry.startTime);
        });

      }, 0);
    });
  }

  private trackResource(entry: PerformanceResourceTiming) {
    const resource: ResourceMetrics = {
      name: entry.name,
      type: this.getResourceType(entry.name),
      size: (entry as any).transferSize || 0,
      duration: entry.responseEnd - entry.startTime,
      timestamp: new Date()
    };

    this.resourceMetrics.push(resource);
    if (this.resourceMetrics.length > this.maxMetrics) {
      this.resourceMetrics.shift();
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date(),
      metadata
    };

    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log significant metrics in development
    if (process.env.NODE_ENV === 'development') {
      if (['LCP', 'FID', 'CLS', 'LoadComplete'].includes(name)) {
        console.log(`[Performance] ${name}: ${value.toFixed(2)}${name === 'CLS' ? '' : 'ms'}`);
      }
    }
  }

  // Track custom user interactions
  trackUserAction(action: string, duration?: number, metadata?: Record<string, any>) {
    this.recordMetric(`UserAction:${action}`, duration || 0, metadata);
  }

  // Track API call performance
  trackAPICall(endpoint: string, duration: number, success: boolean, metadata?: Record<string, any>) {
    this.recordMetric('APICall', duration, {
      endpoint,
      success,
      ...metadata
    });
  }

  // Track search performance
  trackSearch(query: string, duration: number, resultCount: number) {
    this.recordMetric('SearchPerformance', duration, {
      query: query.length > 50 ? query.substring(0, 50) + '...' : query,
      resultCount,
      queryLength: query.length
    });
  }

  getMetrics(type?: string): PerformanceMetric[] {
    if (!type) return [...this.metrics];
    return this.metrics.filter(metric => metric.name.includes(type));
  }

  getResourceMetrics(type?: string): ResourceMetrics[] {
    if (!type) return [...this.resourceMetrics];
    return this.resourceMetrics.filter(resource => resource.type === type);
  }

  getPerformanceSummary() {
    const now = Date.now();
    const last24h = new Date(now - 24 * 60 * 60 * 1000);
    
    const recentMetrics = this.metrics.filter(m => m.timestamp > last24h);
    const recentResources = this.resourceMetrics.filter(r => r.timestamp > last24h);

    // Core Web Vitals summary
    const lcp = recentMetrics.filter(m => m.name === 'LCP');
    const fid = recentMetrics.filter(m => m.name === 'FID');
    const cls = recentMetrics.filter(m => m.name === 'CLS');

    // API performance
    const apiCalls = recentMetrics.filter(m => m.name === 'APICall');
    const successfulAPICalls = apiCalls.filter(m => m.metadata?.success);

    // Search performance
    const searches = recentMetrics.filter(m => m.name === 'SearchPerformance');

    return {
      coreWebVitals: {
        lcp: lcp.length > 0 ? {
          average: lcp.reduce((sum, m) => sum + m.value, 0) / lcp.length,
          latest: lcp[lcp.length - 1]?.value,
          count: lcp.length
        } : null,
        fid: fid.length > 0 ? {
          average: fid.reduce((sum, m) => sum + m.value, 0) / fid.length,
          latest: fid[fid.length - 1]?.value,
          count: fid.length
        } : null,
        cls: cls.length > 0 ? {
          average: cls.reduce((sum, m) => sum + m.value, 0) / cls.length,
          latest: cls[cls.length - 1]?.value,
          count: cls.length
        } : null
      },
      api: {
        totalCalls: apiCalls.length,
        successRate: apiCalls.length > 0 ? (successfulAPICalls.length / apiCalls.length) * 100 : 0,
        averageResponseTime: apiCalls.length > 0 ? 
          apiCalls.reduce((sum, m) => sum + m.value, 0) / apiCalls.length : 0
      },
      search: {
        totalSearches: searches.length,
        averageResponseTime: searches.length > 0 ?
          searches.reduce((sum, m) => sum + m.value, 0) / searches.length : 0,
        averageResultCount: searches.length > 0 ?
          searches.reduce((sum, m) => sum + (m.metadata?.resultCount || 0), 0) / searches.length : 0
      },
      resources: {
        totalRequests: recentResources.length,
        totalSize: recentResources.reduce((sum, r) => sum + r.size, 0),
        averageLoadTime: recentResources.length > 0 ?
          recentResources.reduce((sum, r) => sum + r.duration, 0) / recentResources.length : 0,
        breakdown: this.getResourceBreakdown(recentResources)
      }
    };
  }

  private getResourceBreakdown(resources: ResourceMetrics[]) {
    const breakdown: Record<string, { count: number; totalSize: number; avgDuration: number }> = {};
    
    resources.forEach(resource => {
      if (!breakdown[resource.type]) {
        breakdown[resource.type] = { count: 0, totalSize: 0, avgDuration: 0 };
      }
      breakdown[resource.type].count++;
      breakdown[resource.type].totalSize += resource.size;
      breakdown[resource.type].avgDuration += resource.duration;
    });

    // Calculate averages
    Object.keys(breakdown).forEach(type => {
      breakdown[type].avgDuration = breakdown[type].avgDuration / breakdown[type].count;
    });

    return breakdown;
  }

  cleanup() {
    // Clear old metrics (older than 24 hours)
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    this.resourceMetrics = this.resourceMetrics.filter(r => r.timestamp > cutoff);
  }

  destroy() {
    // Clean up observers
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (e) {
        // Ignore errors when disconnecting
      }
    });
    this.observers = [];
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// Auto cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    performanceMonitor.cleanup();
  }, 60 * 60 * 1000);
}

export type { PerformanceMetric, PageLoadMetrics, ResourceMetrics };