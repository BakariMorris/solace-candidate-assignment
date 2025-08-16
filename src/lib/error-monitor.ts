"use client";

interface ErrorEvent {
  timestamp: Date;
  message: string;
  stack?: string;
  url?: string;
  line?: number;
  column?: number;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  type: 'javascript' | 'network' | 'promise' | 'react' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  topErrors: Array<{ message: string; count: number; lastOccurred: Date }>;
  errorRate: number; // errors per minute
}

class ErrorMonitor {
  private errors: ErrorEvent[] = [];
  private readonly maxErrors = 1000;
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    
    if (typeof window !== 'undefined') {
      this.initializeErrorHandlers();
    }
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private initializeErrorHandlers() {
    // Global JavaScript error handler
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        line: event.lineno,
        column: event.colno,
        type: 'javascript',
        severity: this.determineSeverity(event.message, event.error),
        metadata: {
          errorEvent: true,
          target: event.target?.toString()
        }
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        type: 'promise',
        severity: 'high',
        metadata: {
          promiseRejection: true,
          reason: event.reason
        }
      });
    });

    // Network error detection
    this.setupNetworkErrorMonitoring();
  }

  private setupNetworkErrorMonitoring() {
    // Monitor fetch requests for errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok) {
          this.logError({
            message: `Network request failed: ${response.status} ${response.statusText}`,
            type: 'network',
            severity: response.status >= 500 ? 'high' : 'medium',
            metadata: {
              url: args[0]?.toString(),
              status: response.status,
              statusText: response.statusText,
              method: (args[1] as any)?.method || 'GET'
            }
          });
        }
        
        return response;
      } catch (error) {
        this.logError({
          message: `Network request error: ${error instanceof Error ? error.message : String(error)}`,
          stack: error instanceof Error ? error.stack : undefined,
          type: 'network',
          severity: 'high',
          metadata: {
            url: args[0]?.toString(),
            method: (args[1] as any)?.method || 'GET',
            networkError: true
          }
        });
        throw error;
      }
    };
  }

  private determineSeverity(message: string, error?: Error): 'low' | 'medium' | 'high' | 'critical' {
    const lowerMessage = message.toLowerCase();
    
    // Critical errors
    if (lowerMessage.includes('security') || 
        lowerMessage.includes('unauthorized') ||
        lowerMessage.includes('csrf') ||
        lowerMessage.includes('xss')) {
      return 'critical';
    }
    
    // High severity
    if (lowerMessage.includes('uncaught') ||
        lowerMessage.includes('typeerror') ||
        lowerMessage.includes('referenceerror') ||
        lowerMessage.includes('network') ||
        lowerMessage.includes('failed to fetch')) {
      return 'high';
    }
    
    // Medium severity
    if (lowerMessage.includes('warning') ||
        lowerMessage.includes('deprecated') ||
        lowerMessage.includes('validation')) {
      return 'medium';
    }
    
    return 'low';
  }

  logError(event: Omit<ErrorEvent, 'timestamp' | 'sessionId' | 'userAgent'>) {
    const errorEvent: ErrorEvent = {
      ...event,
      timestamp: new Date(),
      sessionId: this.sessionId,
      userId: this.userId,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    };

    this.errors.push(errorEvent);

    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Error Monitor] ${event.type.toUpperCase()} (${event.severity}): ${event.message}`, {
        stack: event.stack,
        metadata: event.metadata
      });
    }

    // For critical errors, you might want to send to external service
    if (event.severity === 'critical') {
      this.reportCriticalError(errorEvent);
    }
  }

  private reportCriticalError(error: ErrorEvent) {
    // In a production environment, you would send this to Sentry, LogRocket, etc.
    console.error('[CRITICAL ERROR]', error);
    
    // Example: Send to external monitoring service
    // this.sendToMonitoringService(error);
  }

  logReactError(error: Error, errorInfo: any, componentStack?: string) {
    this.logError({
      message: error.message,
      stack: error.stack,
      type: 'react',
      severity: 'high',
      metadata: {
        componentStack,
        errorInfo,
        reactError: true
      }
    });
  }

  logCustomError(message: string, metadata?: Record<string, any>, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
    this.logError({
      message,
      type: 'custom',
      severity,
      metadata
    });
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  getErrors(type?: string, severity?: string): ErrorEvent[] {
    let filtered = [...this.errors];
    
    if (type) {
      filtered = filtered.filter(error => error.type === type);
    }
    
    if (severity) {
      filtered = filtered.filter(error => error.severity === severity);
    }
    
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getErrorStats(timeRange?: { start: Date; end: Date }): ErrorStats {
    let relevantErrors = this.errors;
    
    if (timeRange) {
      relevantErrors = this.errors.filter(error => 
        error.timestamp >= timeRange.start && error.timestamp <= timeRange.end
      );
    }

    const totalErrors = relevantErrors.length;
    
    // Group by type
    const errorsByType = relevantErrors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by severity
    const errorsBySeverity = relevantErrors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top errors by frequency
    const errorCounts = new Map<string, { count: number; lastOccurred: Date }>();
    relevantErrors.forEach(error => {
      const key = error.message.substring(0, 100); // Truncate long messages
      const existing = errorCounts.get(key);
      if (existing) {
        existing.count++;
        if (error.timestamp > existing.lastOccurred) {
          existing.lastOccurred = error.timestamp;
        }
      } else {
        errorCounts.set(key, { count: 1, lastOccurred: error.timestamp });
      }
    });

    const topErrors = Array.from(errorCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([message, data]) => ({
        message,
        count: data.count,
        lastOccurred: data.lastOccurred
      }));

    // Calculate error rate (errors per minute)
    const timeSpan = timeRange 
      ? timeRange.end.getTime() - timeRange.start.getTime()
      : 60 * 60 * 1000; // Default to 1 hour
    const minutes = timeSpan / (1000 * 60);
    const errorRate = totalErrors / Math.max(minutes, 1);

    return {
      totalErrors,
      errorsByType,
      errorsBySeverity,
      topErrors,
      errorRate
    };
  }

  getErrorTrends(hours = 24): Array<{ hour: string; count: number; severity: Record<string, number> }> {
    const now = new Date();
    const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
    
    const trends: Array<{ hour: string; count: number; severity: Record<string, number> }> = [];
    
    for (let i = 0; i < hours; i++) {
      const hourStart = new Date(startTime.getTime() + i * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
      
      const hourErrors = this.errors.filter(error => 
        error.timestamp >= hourStart && error.timestamp < hourEnd
      );
      
      const severityBreakdown = hourErrors.reduce((acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      trends.push({
        hour: hourStart.toISOString().substring(0, 13) + ':00',
        count: hourErrors.length,
        severity: severityBreakdown
      });
    }
    
    return trends;
  }

  clear() {
    this.errors = [];
  }

  cleanup(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days default
    const cutoff = new Date(Date.now() - maxAge);
    this.errors = this.errors.filter(error => error.timestamp > cutoff);
  }

  // Export errors for external analysis
  exportErrors(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'type', 'severity', 'message', 'url', 'line', 'column', 'sessionId', 'userId'];
      const rows = this.errors.map(error => [
        error.timestamp.toISOString(),
        error.type,
        error.severity,
        `"${error.message.replace(/"/g, '""')}"`,
        error.url || '',
        error.line || '',
        error.column || '',
        error.sessionId,
        error.userId || ''
      ]);
      
      return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }
    
    return JSON.stringify(this.errors, null, 2);
  }
}

// Global instance
export const errorMonitor = new ErrorMonitor();

// Auto cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    errorMonitor.cleanup();
  }, 60 * 60 * 1000);
}

export type { ErrorEvent, ErrorStats };