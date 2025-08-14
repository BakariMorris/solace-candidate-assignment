export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code || this.getDefaultCode(statusCode);
    this.details = details;
  }

  private getDefaultCode(statusCode: number): string {
    switch (statusCode) {
      case 400: return 'BAD_REQUEST';
      case 401: return 'UNAUTHORIZED';
      case 403: return 'FORBIDDEN';
      case 404: return 'NOT_FOUND';
      case 429: return 'RATE_LIMITED';
      case 500: return 'INTERNAL_SERVER_ERROR';
      case 502: return 'BAD_GATEWAY';
      case 503: return 'SERVICE_UNAVAILABLE';
      default: return 'UNKNOWN_ERROR';
    }
  }

  toJSON() {
    return {
      error: this.code,
      message: this.message,
      statusCode: this.statusCode,
      ...(this.details && { details: this.details }),
    };
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class RateLimitError extends ApiError {
  constructor(retryAfter: number) {
    super('Rate limit exceeded', 429, 'RATE_LIMITED', { retryAfter });
  }
}

export interface ErrorLogEntry {
  timestamp: Date;
  error: ApiError | Error;
  request?: {
    method: string;
    url: string;
    headers: Record<string, string>;
    userAgent?: string;
    ip?: string;
  };
  stack?: string;
}

class ErrorLogger {
  private errors: ErrorLogEntry[] = [];
  private readonly maxErrors = 1000;

  log(error: Error | ApiError, request?: Request) {
    const entry: ErrorLogEntry = {
      timestamp: new Date(),
      error,
      stack: error.stack,
    };

    if (request) {
      entry.request = {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
        userAgent: request.headers.get('user-agent') || undefined,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      };
    }

    this.errors.push(entry);

    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[API Error] ${error.message}`, {
        ...(error instanceof ApiError && { statusCode: error.statusCode, code: error.code }),
        ...(entry.request && { request: entry.request }),
      });
    }
  }

  getRecentErrors(limit = 50): ErrorLogEntry[] {
    return this.errors.slice(-limit);
  }

  getErrorsByType(errorType: string): ErrorLogEntry[] {
    return this.errors.filter(entry => 
      entry.error instanceof ApiError && entry.error.code === errorType
    );
  }

  getErrorStats() {
    const total = this.errors.length;
    const byType = this.errors.reduce((acc, entry) => {
      const type = entry.error instanceof ApiError ? entry.error.code : 'UNKNOWN';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recent = this.errors.filter(entry => 
      Date.now() - entry.timestamp.getTime() < 60000 // Last minute
    ).length;

    return {
      total,
      recentErrors: recent,
      errorsByType: byType,
    };
  }

  clear() {
    this.errors = [];
  }
}

export const errorLogger = new ErrorLogger();

export function createErrorResponse(error: Error | ApiError): Response {
  let statusCode = 500;
  let errorData: any = {
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  };

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    errorData = error.toJSON();
  } else {
    // Log unexpected errors
    errorLogger.log(error);
    
    // Don't expose internal error details in production
    if (process.env.NODE_ENV === 'development') {
      errorData.message = error.message;
      errorData.stack = error.stack;
    }
  }

  return new Response(JSON.stringify(errorData), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ApiError) {
        errorLogger.log(error, args[0] instanceof Request ? args[0] : undefined);
        return createErrorResponse(error);
      }
      
      // Handle unexpected errors
      const apiError = new ApiError(
        process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : 'An unexpected error occurred'
      );
      
      errorLogger.log(apiError, args[0] instanceof Request ? args[0] : undefined);
      return createErrorResponse(apiError);
    }
  };
}

export function validateSearchParams(params: URLSearchParams): void {
  const page = params.get('page');
  if (page && (isNaN(Number(page)) || Number(page) < 1)) {
    throw new ValidationError('Page must be a positive integer');
  }

  const limit = params.get('limit');
  if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    throw new ValidationError('Limit must be between 1 and 100');
  }

  const minExperience = params.get('minExperience');
  if (minExperience && (isNaN(Number(minExperience)) || Number(minExperience) < 0)) {
    throw new ValidationError('Minimum experience must be a non-negative number');
  }

  const maxExperience = params.get('maxExperience');
  if (maxExperience && (isNaN(Number(maxExperience)) || Number(maxExperience) < 0)) {
    throw new ValidationError('Maximum experience must be a non-negative number');
  }

  if (minExperience && maxExperience && Number(minExperience) > Number(maxExperience)) {
    throw new ValidationError('Minimum experience cannot be greater than maximum experience');
  }

  const sortBy = params.get('sortBy');
  const validSortFields = ['firstName', 'lastName', 'city', 'yearsOfExperience', 'createdAt'];
  if (sortBy && !validSortFields.includes(sortBy)) {
    throw new ValidationError(`Invalid sort field. Must be one of: ${validSortFields.join(', ')}`);
  }

  const sortOrder = params.get('sortOrder');
  if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
    throw new ValidationError('Sort order must be either "asc" or "desc"');
  }
}