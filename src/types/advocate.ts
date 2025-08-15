export interface Advocate {
  id?: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
  profileImageUrl?: string;
  bio?: string;
  createdAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  degree?: string;
  specialties?: string[];
  minExperience?: number;
  maxExperience?: number;
  sortBy?: 'firstName' | 'lastName' | 'city' | 'yearsOfExperience' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  cursor?: string;
}

export interface SearchFilters {
  search?: string;
  city?: string;
  degree?: string;
  specialties?: string[];
  experienceRange?: {
    min?: number;
    max?: number;
  };
}

export interface SortOptions {
  field: 'firstName' | 'lastName' | 'city' | 'yearsOfExperience' | 'createdAt';
  order: 'asc' | 'desc';
}