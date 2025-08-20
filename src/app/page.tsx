"use client";

import { useEffect, useMemo, useCallback, Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { Heart, Scale } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Advocate } from "../types/advocate";
import VirtualizedAdvocateTable from "../components/VirtualizedAdvocateTable";
import EnhancedSearchForm from "../components/EnhancedSearchForm";
import AdvancedFilters from "../components/AdvancedFilters";
import FilterChips from "../components/FilterChips";
import AdvocateCard from "../components/AdvocateCard";
import AdvocateProfileModal from "../components/AdvocateProfileModal";
import BookingModal from "../components/BookingModal";
import ViewControls, { ViewMode, SortOption, SortDirection } from "../components/ViewControls";
import { useSearchStore } from "../store/useSearchStore";
import { useFavoritesStore } from "../store/useFavoritesStore";
import { useComparisonStore } from "../store/useComparisonStore";
import { useUrlState } from "../hooks/useUrlState";
import Link from "next/link";
import { ThemeToggle } from "../components/theme-toggle";
import OnboardingTour from "../components/OnboardingTour";
import TrendingSearches from "../components/TrendingSearches";
import { useOnboarding } from "../hooks/useOnboarding";
import { useGeolocation } from "../hooks/useGeolocation";
import { getAdvocateDistance } from "../utils/distance";
import { performanceMonitor } from "../lib/performance-monitor";
import { userAnalytics } from "../lib/user-analytics";
import { searchAnalytics } from "../lib/search-analytics";

const fetchAdvocates = async (): Promise<Advocate[]> => {
  const startTime = performance.now();
  
  try {
    const res = await fetch("/api/advocates", {
      headers: {
        'Cache-Control': 'max-age=300', // 5 minutes
      },
    });
    
    const duration = performance.now() - startTime;
    
    if (!res.ok) {
      performanceMonitor.trackAPICall('/api/advocates', duration, false, {
        status: res.status,
        statusText: res.statusText
      });
      throw new Error(`Failed to fetch advocates: ${res.status} ${res.statusText}`);
    }
    
    const jsonResponse = await res.json();
    
    performanceMonitor.trackAPICall('/api/advocates', duration, true, {
      resultCount: jsonResponse.data?.length || 0,
      cached: res.headers.get('X-Cache') === 'HIT'
    });
    
    return jsonResponse.data;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceMonitor.trackAPICall('/api/advocates', duration, false, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

function HomeContent() {
  const { 
    searchTerm, 
    setSearchTerm, 
    addRecentSearch
  } = useSearchStore();
  
  const { favorites } = useFavoritesStore();
  const { selectedForComparison } = useComparisonStore();
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();
  const { coordinates } = useGeolocation();
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<{
    specialties: string[];
    locations: string[];
    experienceRange: [number, number];
    availability: string[];
    nearMe?: boolean;
    maxDistance?: number;
  }>({
    specialties: [],
    locations: [],
    experienceRange: [0, 30],
    availability: [],
    nearMe: false,
    maxDistance: 25
  });
  const [selectedAdvocate, setSelectedAdvocate] = useState<Advocate | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [bookingAdvocate, setBookingAdvocate] = useState<Advocate | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  useUrlState();

  // Track page view on mount
  useEffect(() => {
    userAnalytics.trackPageView('/');
  }, []);
  
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const { data: advocates = [], isLoading, error, refetch } = useQuery({
    queryKey: ['advocates'],
    queryFn: fetchAdvocates,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      addRecentSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, addRecentSearch]);

  const filterAdvocates = useCallback((advocate: Advocate, term: string) => {
    if (!term.trim()) return true;
    
    const lowerSearchTerm = term.toLowerCase();
    
    if (advocate.firstName.toLowerCase().includes(lowerSearchTerm) ||
        advocate.lastName.toLowerCase().includes(lowerSearchTerm) ||
        advocate.city.toLowerCase().includes(lowerSearchTerm) ||
        advocate.degree.toLowerCase().includes(lowerSearchTerm) ||
        advocate.phoneNumber.toString().includes(term)) {
      return true;
    }
    
    if (advocate.specialties.some(specialty => 
        specialty.toLowerCase().includes(lowerSearchTerm))) {
      return true;
    }
    
    return advocate.yearsOfExperience.toString().includes(term);
  }, []);

  // Optimistic filtering - show immediate results for better UX
  const optimisticAdvocates = useMemo(() => {
    return advocates.filter(advocate => 
      filterAdvocates(advocate, searchTerm)
    );
  }, [advocates, searchTerm, filterAdvocates]);

  // Debounced filtering for final state
  const filteredAdvocates = useMemo(() => {
    return advocates.filter(advocate => 
      filterAdvocates(advocate, debouncedSearchTerm)
    );
  }, [advocates, debouncedSearchTerm, filterAdvocates]);

  // Get the current filtered advocates list (immediate vs debounced search results)
  const currentAdvocates = searchTerm !== debouncedSearchTerm ? optimisticAdvocates : filteredAdvocates;

  // Get unique specialties and locations for filters
  const availableSpecialties = useMemo(() => {
    const allSpecialties = advocates.flatMap(advocate => advocate.specialties);
    return Array.from(new Set(allSpecialties)).sort();
  }, [advocates]);

  const availableLocations = useMemo(() => {
    const allLocations = advocates.map(advocate => advocate.city);
    return Array.from(new Set(allLocations)).sort();
  }, [advocates]);

  // Apply advanced filters
  const filteredByAdvancedFilters = useMemo(() => {
    return currentAdvocates.filter(advocate => {
      // Specialty filter
      if (filters.specialties.length > 0) {
        const hasMatchingSpecialty = advocate.specialties.some(specialty =>
          filters.specialties.includes(specialty)
        );
        if (!hasMatchingSpecialty) return false;
      }

      // Location filter
      if (filters.locations.length > 0) {
        if (!filters.locations.includes(advocate.city)) return false;
      }

      // Distance filter (Near Me)
      if (filters.nearMe === true && coordinates) {
        const distance = getAdvocateDistance(advocate.city, coordinates);
        if (distance === null || distance > (filters.maxDistance ?? 25)) {
          return false;
        }
      }

      // Experience range filter
      if (advocate.yearsOfExperience < filters.experienceRange[0] ||
          advocate.yearsOfExperience > filters.experienceRange[1]) {
        return false;
      }

      return true;
    });
  }, [currentAdvocates, filters, coordinates]);

  // Apply sorting
  const sortedAdvocates = useMemo(() => {
    const sorted = [...filteredByAdvancedFilters];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          break;
        case 'location':
          comparison = a.city.localeCompare(b.city);
          break;
        case 'experience':
          comparison = a.yearsOfExperience - b.yearsOfExperience;
          break;
        case 'rating':
          // Generate consistent rating based on experience
          const ratingA = Math.min(5.0, 4.0 + (a.yearsOfExperience / 25));
          const ratingB = Math.min(5.0, 4.0 + (b.yearsOfExperience / 25));
          comparison = ratingA - ratingB;
          break;
        case 'relevance':
        default:
          // Default relevance sorting (by ID for consistency, fallback to 0 if undefined)
          comparison = (a.id || 0) - (b.id || 0);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [filteredByAdvancedFilters, sortBy, sortDirection]);

  // Track search performance when results change
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      const searchDuration = 5; // Approximate client-side filtering time
      performanceMonitor.trackSearch(debouncedSearchTerm, searchDuration, sortedAdvocates.length);
      
      // Track search in analytics
      userAnalytics.trackSearchPerformed(debouncedSearchTerm, sortedAdvocates.length, 5);
      searchAnalytics.logSearch({
        query: debouncedSearchTerm,
        filters: filters,
        resultCount: sortedAdvocates.length,
        responseTime: 5
      });
    }
  }, [debouncedSearchTerm, sortedAdvocates.length, filters]);

  // Generate active filters for filter chips
  const activeFilters = useMemo(() => {
    const filters_list = [];
    
    if (searchTerm) {
      filters_list.push({
        id: 'search',
        label: `Search: ${searchTerm}`,
        type: 'search' as const
      });
    }
    
    filters.specialties.forEach(specialty => {
      filters_list.push({
        id: `specialty-${specialty}`,
        label: specialty,
        type: 'specialty' as const
      });
    });
    
    filters.locations.forEach(location => {
      filters_list.push({
        id: `location-${location}`,
        label: location,
        type: 'location' as const
      });
    });
    
    if (filters.experienceRange[0] > 0 || filters.experienceRange[1] < 30) {
      filters_list.push({
        id: 'experience',
        label: `Experience: ${filters.experienceRange[0]}-${filters.experienceRange[1]} years`,
        type: 'experience' as const
      });
    }
    
    filters.availability.forEach(availability => {
      filters_list.push({
        id: `availability-${availability}`,
        label: availability,
        type: 'availability' as const
      });
    });
    
    return filters_list;
  }, [searchTerm, filters]);

  const handleRemoveFilter = (filterId: string) => {
    // Track filter removal
    userAnalytics.trackEvent('filter_removed', 'interaction', 'remove_filter', filterId);
    
    if (filterId === 'search') {
      setSearchTerm('');
    } else if (filterId.startsWith('specialty-')) {
      const specialty = filterId.replace('specialty-', '');
      setFilters(prev => ({
        ...prev,
        specialties: prev.specialties.filter(s => s !== specialty)
      }));
    } else if (filterId.startsWith('location-')) {
      const location = filterId.replace('location-', '');
      setFilters(prev => ({
        ...prev,
        locations: prev.locations.filter(l => l !== location)
      }));
    } else if (filterId === 'experience') {
      setFilters(prev => ({
        ...prev,
        experienceRange: [0, 30]
      }));
    } else if (filterId.startsWith('availability-')) {
      const availability = filterId.replace('availability-', '');
      setFilters(prev => ({
        ...prev,
        availability: prev.availability.filter(a => a !== availability)
      }));
    }
  };

  const handleClearAllFilters = () => {
    // Track clear all filters action
    userAnalytics.trackEvent('clear_all_filters', 'interaction', 'clear_filters');
    
    setSearchTerm('');
    setFilters({
      specialties: [],
      locations: [],
      experienceRange: [0, 30],
      availability: [],
      nearMe: false,
      maxDistance: 25
    });
  };

  const handleViewProfile = (advocate: Advocate) => {
    // Track advocate profile view
    userAnalytics.trackAdvocateView(advocate.id!, `${advocate.firstName} ${advocate.lastName}`);
    
    setSelectedAdvocate(advocate);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedAdvocate(null);
  };

  const handleBookConsultation = (advocate: Advocate) => {
    // Track booking consultation start
    userAnalytics.trackBookingStarted(advocate.id!);
    
    setBookingAdvocate(advocate);
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingAdvocate(null);
  };

  if (isLoading) {
    return (
      <div style={{ margin: "24px", textAlign: "center", padding: "2rem" }}>
        <div>Loading advocates...</div>
        <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#666" }}>
          Please wait while we fetch the latest advocate data.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ margin: "24px", textAlign: "center", padding: "2rem", color: "#d32f2f" }}>
        <div>Error loading advocates</div>
        <div style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
          {error instanceof Error ? error.message : "An unexpected error occurred"}
        </div>
        <button 
          onClick={() => window.location.reload()} 
          style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-3">
          <Link href="/compare" data-tour="compare-nav">
            <Button variant="outline" className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground">
              <Scale className={`h-4 w-4 ${selectedForComparison.length > 0 ? 'text-primary' : ''}`} />
              Compare
              {selectedForComparison.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedForComparison.length}
                </Badge>
              )}
            </Button>
          </Link>
          <Link href="/favorites" data-tour="favorites-nav">
            <Button variant="outline" className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground">
              <Heart className={`h-4 w-4 ${favorites.length > 0 ? 'fill-primary text-primary' : ''}`} />
              Favorites
              {favorites.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {favorites.length}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-display mb-4">Healthcare Advocates</h1>
        <p className="text-body-lg text-muted-foreground">
          Find the perfect healthcare advocate to support your journey
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex-1 w-full lg:w-auto" data-tour="search">
            <EnhancedSearchForm onSearch={setSearchTerm} />
          </div>
          <div data-tour="filters">
            <AdvancedFilters
              onFiltersChange={setFilters}
              availableSpecialties={availableSpecialties}
              availableLocations={availableLocations}
            />
          </div>
        </div>

        {/* Active Filters */}
        <FilterChips
          activeFilters={activeFilters}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAllFilters}
        />

        {/* Trending Searches */}
        {searchTerm === '' && activeFilters.length === 0 && (
          <TrendingSearches 
            onSearchSelect={setSearchTerm}
            className="mt-4"
          />
        )}
      </div>

      {/* View Controls */}
      <ViewControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={(option, direction) => {
          setSortBy(option);
          setSortDirection(direction);
        }}
        totalCount={sortedAdvocates.length}
        isLoading={isLoading}
      />

      {/* Results */}
      <div className="min-h-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-body text-muted-foreground">Loading advocates...</div>
          </div>
        ) : sortedAdvocates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-h3 text-muted-foreground">No advocates found</div>
            <p className="text-body text-muted-foreground text-center max-w-md">
              Try adjusting your search criteria or clearing some filters to see more results.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedAdvocates.map((advocate) => (
              <AdvocateCard
                key={advocate.id}
                advocate={advocate}
                onViewProfile={handleViewProfile}
                onBookConsultation={handleBookConsultation}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <VirtualizedAdvocateTable 
              advocates={sortedAdvocates} 
              height={600}
              onViewProfile={handleViewProfile}
            />
          </div>
        )}
      </div>

      {/* Profile Modal */}
      <AdvocateProfileModal
        advocate={selectedAdvocate}
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        onBookConsultation={handleBookConsultation}
        allAdvocates={advocates}
        onViewProfile={handleViewProfile}
      />

      {/* Booking Modal */}
      <BookingModal
        advocate={bookingAdvocate}
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={showOnboarding}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
      />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div style={{ margin: "24px", textAlign: "center", padding: "2rem" }}>
        <div>Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
