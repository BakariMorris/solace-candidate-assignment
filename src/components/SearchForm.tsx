"use client";

import { memo, useCallback } from "react";
import { useSearchStore } from "../store/useSearchStore";

interface SearchFormProps {
  onSearch?: (term: string) => void;
  placeholder?: string;
  showRecentSearches?: boolean;
}

const SearchForm = memo(({ 
  onSearch, 
  placeholder = "Search advocates...",
  showRecentSearches = true 
}: SearchFormProps) => {
  const { 
    searchTerm, 
    setSearchTerm, 
    recentSearches, 
    clearRecentSearches,
    resetAll 
  } = useSearchStore();

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch?.(value);
  }, [setSearchTerm, onSearch]);

  const handleRecentSearchClick = useCallback((term: string) => {
    setSearchTerm(term);
    onSearch?.(term);
  }, [setSearchTerm, onSearch]);

  const handleReset = useCallback(() => {
    resetAll();
    onSearch?.("");
  }, [resetAll, onSearch]);

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <input 
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={placeholder}
          style={{ 
            border: "1px solid #ddd", 
            padding: "0.5rem", 
            width: "400px",
            borderRadius: "4px",
            fontSize: "1rem"
          }}
        />
        <button 
          onClick={handleReset}
          style={{ 
            padding: "0.5rem 1rem",
            backgroundColor: "#f5f5f5",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Reset
        </button>
      </div>

      {showRecentSearches && recentSearches.length > 0 && (
        <div style={{ fontSize: "0.9rem" }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem",
            marginBottom: "0.25rem"
          }}>
            <span style={{ color: "#666" }}>Recent searches:</span>
            <button
              onClick={clearRecentSearches}
              style={{
                background: "none",
                border: "none",
                color: "#dc2626",
                fontSize: "0.8rem",
                cursor: "pointer",
                textDecoration: "underline"
              }}
            >
              Clear all
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
            {recentSearches.map((term, index) => (
              <button
                key={index}
                onClick={() => handleRecentSearchClick(term)}
                style={{
                  padding: "0.25rem 0.5rem",
                  backgroundColor: "#f0f9ff",
                  border: "1px solid #bae6fd",
                  borderRadius: "12px",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  color: "#0c4a6e"
                }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

SearchForm.displayName = "SearchForm";

export default SearchForm;