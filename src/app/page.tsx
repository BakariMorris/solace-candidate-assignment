"use client";

import { useEffect, useMemo, useCallback, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { Advocate } from "../types/advocate";
import VirtualizedAdvocateTable from "../components/VirtualizedAdvocateTable";
import SearchForm from "../components/SearchForm";
import { useSearchStore } from "../store/useSearchStore";
import { useUrlState } from "../hooks/useUrlState";

const fetchAdvocates = async (): Promise<Advocate[]> => {
  const res = await fetch("/api/advocates", {
    headers: {
      'Cache-Control': 'max-age=300', // 5 minutes
    },
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch advocates: ${res.status} ${res.statusText}`);
  }
  
  const jsonResponse = await res.json();
  return jsonResponse.data;
};

function HomeContent() {
  const { 
    searchTerm, 
    setSearchTerm, 
    addRecentSearch
  } = useSearchStore();
  
  useUrlState();
  
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
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Search Advocates</h2>
        <SearchForm onSearch={setSearchTerm} />
        {searchTerm && (
          <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "0.5rem" }}>
            Searching for: <strong>{searchTerm}</strong>
            {searchTerm !== debouncedSearchTerm && (
              <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem", color: "#666" }}>
                (searching...)
              </span>
            )}
          </p>
        )}
      </div>
      <br />
      <div style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "#666" }}>
        Showing {currentAdvocates.length} of {advocates.length} advocates
        {searchTerm !== debouncedSearchTerm && (
          <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem", color: "#f59e0b" }}>
            (updating...)
          </span>
        )}
      </div>
      <VirtualizedAdvocateTable 
        advocates={currentAdvocates} 
        height={600} 
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
