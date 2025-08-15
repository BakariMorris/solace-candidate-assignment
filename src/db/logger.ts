interface QueryLog {
  query: string;
  params?: any[];
  duration: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}

class DatabaseLogger {
  private logs: QueryLog[] = [];
  private readonly maxLogs = 1000;

  log(queryLog: QueryLog) {
    this.logs.push(queryLog);
    
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (process.env.NODE_ENV === 'development') {
      const status = queryLog.success ? '✓' : '✗';
      const durationColor = queryLog.duration > 1000 ? '\x1b[31m' : queryLog.duration > 500 ? '\x1b[33m' : '\x1b[32m';
      
      console.log(`${status} [DB] ${durationColor}${queryLog.duration}ms\x1b[0m - ${queryLog.query.substring(0, 100)}${queryLog.query.length > 100 ? '...' : ''}`);
      
      if (!queryLog.success && queryLog.error) {
        console.error(`[DB Error] ${queryLog.error}`);
      }
    }
  }

  getRecentLogs(limit = 50): QueryLog[] {
    return this.logs.slice(-limit);
  }

  getSlowQueries(threshold = 1000): QueryLog[] {
    return this.logs.filter(log => log.duration > threshold);
  }

  getErrorLogs(): QueryLog[] {
    return this.logs.filter(log => !log.success);
  }

  getAverageQueryTime(): number {
    if (this.logs.length === 0) return 0;
    const total = this.logs.reduce((sum, log) => sum + log.duration, 0);
    return total / this.logs.length;
  }

  getQueryStats() {
    const total = this.logs.length;
    const successful = this.logs.filter(log => log.success).length;
    const failed = total - successful;
    const avgTime = this.getAverageQueryTime();
    const slowQueries = this.getSlowQueries().length;

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      averageQueryTime: avgTime,
      slowQueries,
    };
  }

  clear() {
    this.logs = [];
  }
}

export const dbLogger = new DatabaseLogger();

export async function loggedQuery<T>(
  queryFn: () => Promise<T>,
  queryName: string,
  queryString?: string
): Promise<T> {
  const startTime = Date.now();
  const timestamp = new Date();
  
  try {
    const result = await queryFn();
    const duration = Date.now() - startTime;
    
    dbLogger.log({
      query: queryString || queryName,
      duration,
      timestamp,
      success: true,
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    dbLogger.log({
      query: queryString || queryName,
      duration,
      timestamp,
      success: false,
      error: errorMessage,
    });
    
    throw error;
  }
}

export type { QueryLog };