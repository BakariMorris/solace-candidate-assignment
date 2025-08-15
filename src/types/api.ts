import { Advocate } from './advocate';

// Raw search params from URL (all strings or null)
export interface RawSearchParams {
  page?: string | null;
  limit?: string | null;
  search?: string | null;
  city?: string | null;
  degree?: string | null;
  specialties?: string | null;
  minExperience?: string | null;
  maxExperience?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
  cursor?: string | null;
}

// Processed search params with proper types and defaults
export interface ProcessedSearchParams {
  page: string;
  limit: string;
  search?: string;
  city?: string;
  degree?: string;
  specialties?: string;
  minExperience?: string;
  maxExperience?: string;
  sortBy: 'firstName' | 'lastName' | 'city' | 'yearsOfExperience' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  cursor?: string;
}

// Numeric versions of pagination params
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

// Filter params for database queries
export interface FilterParams {
  search?: string;
  city?: string;
  degree?: string;
  specialties?: string[];
  minExperience?: number;
  maxExperience?: number;
}

// Sort configuration
export interface SortConfig {
  field: 'firstName' | 'lastName' | 'city' | 'yearsOfExperience' | 'createdAt';
  order: 'asc' | 'desc';
}

// Cursor pagination
export interface CursorPagination {
  cursor?: string;
  direction: 'next' | 'prev';
}

// API Response with pagination metadata
export interface PaginatedApiResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
  meta?: {
    responseTime?: number;
    cached?: boolean;
    source?: 'database' | 'memory';
  };
}

// Rate limiting response
export interface RateLimitInfo {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  limit: number;
}

// Search analytics data
export interface SearchAnalyticsData {
  query: string;
  filters: FilterParams;
  resultCount: number;
  responseTime: number;
  userAgent?: string;
  ip?: string;
  timestamp: Date;
}

// Validation errors
export interface ValidationError {
  field: string;
  message: string;
  received?: any;
  expected?: any;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: ValidationError[];
  code?: string;
  timestamp: string;
}

// Success response wrapper
export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

// Helper type for safe parseInt
export type SafeParseIntResult = {
  value: number;
  isValid: boolean;
  original: string | undefined;
};