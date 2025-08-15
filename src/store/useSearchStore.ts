import { create } from "zustand";

export interface SearchFilters {
  specialties: string[];
  cities: string[];
  minExperience: number;
  maxExperience: number;
  degrees: string[];
}

export interface SearchState {
  searchTerm: string;
  filters: SearchFilters;
  recentSearches: string[];
  viewMode: "list" | "grid";
  sortBy: "relevance" | "experience" | "name";
  sortOrder: "asc" | "desc";
  pageSize: number;
}

export interface SearchActions {
  setSearchTerm: (term: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
  setViewMode: (mode: "list" | "grid") => void;
  setSortBy: (sortBy: SearchState["sortBy"]) => void;
  setSortOrder: (order: "asc" | "desc") => void;
  setPageSize: (size: number) => void;
  resetFilters: () => void;
  resetAll: () => void;
}

export type SearchStore = SearchState & SearchActions;

const initialFilters: SearchFilters = {
  specialties: [],
  cities: [],
  minExperience: 0,
  maxExperience: 50,
  degrees: [],
};

const initialState: SearchState = {
  searchTerm: "",
  filters: initialFilters,
  recentSearches: [],
  viewMode: "list",
  sortBy: "relevance",
  sortOrder: "desc",
  pageSize: 50,
};

export const useSearchStore = create<SearchStore>()((set, get) => ({
  ...initialState,

  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
  },

  setFilters: (newFilters: Partial<SearchFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  addRecentSearch: (term: string) => {
    if (!term.trim()) return;
    
    set((state) => {
      const filtered = state.recentSearches.filter(
        (search) => search.toLowerCase() !== term.toLowerCase()
      );
      return {
        recentSearches: [term, ...filtered].slice(0, 10), // Keep only 10 recent searches
      };
    });
  },

  clearRecentSearches: () => {
    set({ recentSearches: [] });
  },

  setViewMode: (mode: "list" | "grid") => {
    set({ viewMode: mode });
  },

  setSortBy: (sortBy: SearchState["sortBy"]) => {
    set({ sortBy });
  },

  setSortOrder: (order: "asc" | "desc") => {
    set({ sortOrder: order });
  },

  setPageSize: (size: number) => {
    set({ pageSize: Math.max(10, Math.min(100, size)) }); // Clamp between 10-100
  },

  resetFilters: () => {
    set({ filters: initialFilters });
  },

  resetAll: () => {
    set({
      searchTerm: "",
      filters: initialFilters,
    });
  },
}));