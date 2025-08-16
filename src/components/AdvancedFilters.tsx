"use client";

import { useState, useEffect } from "react";
import { Filter, X, MapPin, Briefcase, Star, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";

interface FilterState {
  specialties: string[];
  locations: string[];
  experienceRange: [number, number];
  availability: string[];
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  availableSpecialties: string[];
  availableLocations: string[];
}

export default function AdvancedFilters({ 
  onFiltersChange, 
  availableSpecialties, 
  availableLocations 
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    specialties: [],
    locations: [],
    experienceRange: [0, 30],
    availability: []
  });

  const [searchSpecialty, setSearchSpecialty] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const addFilter = (type: keyof FilterState, value: string | number) => {
    setFilters(prev => {
      if (type === 'specialties' || type === 'locations' || type === 'availability') {
        const currentArray = prev[type] as string[];
        if (!currentArray.includes(value as string)) {
          return {
            ...prev,
            [type]: [...currentArray, value]
          };
        }
      }
      return prev;
    });
  };

  const removeFilter = (type: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: (prev[type] as string[]).filter(item => item !== value)
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      specialties: [],
      locations: [],
      experienceRange: [0, 30],
      availability: []
    });
  };

  const hasActiveFilters = filters.specialties.length > 0 || 
                          filters.locations.length > 0 || 
                          filters.availability.length > 0 ||
                          filters.experienceRange[0] > 0 || 
                          filters.experienceRange[1] < 30;

  const filteredSpecialties = availableSpecialties.filter(specialty =>
    specialty.toLowerCase().includes(searchSpecialty.toLowerCase()) &&
    !filters.specialties.includes(specialty)
  );

  const filteredLocations = availableLocations.filter(location =>
    location.toLowerCase().includes(searchLocation.toLowerCase()) &&
    !filters.locations.includes(location)
  );

  const activeFilterCount = filters.specialties.length + filters.locations.length + filters.availability.length;

  return (
    <div className="relative">
      <Button
        variant={hasActiveFilters ? "default" : "outline"}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative transition-all duration-200 ${isOpen ? 'bg-accent text-accent-foreground' : ''}`}
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop to close the dropdown when clicking outside */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute top-full left-0 mt-2 w-96 z-50 card-elevated shadow-2xl dark:shadow-2xl dark:shadow-black/50">
            <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-h4">Advanced Filters</CardTitle>
              <div className="flex items-center space-x-2">
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear all
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Specialties Filter */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-body font-semibold">Specialties</h4>
              </div>
              
              <Input
                placeholder="Search specialties..."
                value={searchSpecialty}
                onChange={(e) => setSearchSpecialty(e.target.value)}
                className="mb-2"
              />

              {filters.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {filters.specialties.map(specialty => (
                    <Badge key={specialty} variant="default" className="flex items-center gap-1">
                      {specialty}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeFilter('specialties', specialty)}
                      />
                    </Badge>
                  ))}
                </div>
              )}

              <div className="max-h-32 overflow-y-auto space-y-1">
                {filteredSpecialties.slice(0, 10).map(specialty => (
                  <div
                    key={specialty}
                    onClick={() => addFilter('specialties', specialty)}
                    className="p-2 rounded-md hover:bg-accent cursor-pointer text-body-sm"
                  >
                    {specialty}
                  </div>
                ))}
              </div>
            </div>

            {/* Locations Filter */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-body font-semibold">Locations</h4>
              </div>
              
              <Input
                placeholder="Search locations..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="mb-2"
              />

              {filters.locations.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {filters.locations.map(location => (
                    <Badge key={location} variant="default" className="flex items-center gap-1">
                      {location}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeFilter('locations', location)}
                      />
                    </Badge>
                  ))}
                </div>
              )}

              <div className="max-h-32 overflow-y-auto space-y-1">
                {filteredLocations.slice(0, 10).map(location => (
                  <div
                    key={location}
                    onClick={() => addFilter('locations', location)}
                    className="p-2 rounded-md hover:bg-accent cursor-pointer text-body-sm"
                  >
                    {location}
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Range */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Star className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-body font-semibold">Years of Experience</h4>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="text-caption text-muted-foreground">Min</label>
                  <Input
                    type="number"
                    min="0"
                    max="30"
                    value={filters.experienceRange[0]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      experienceRange: [parseInt(e.target.value) || 0, prev.experienceRange[1]]
                    }))}
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-caption text-muted-foreground">Max</label>
                  <Input
                    type="number"
                    min="0"
                    max="30"
                    value={filters.experienceRange[1]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      experienceRange: [prev.experienceRange[0], parseInt(e.target.value) || 30]
                    }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Availability */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-body font-semibold">Availability</h4>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {['Available Now', 'Within 1 Week', 'Within 1 Month', 'Consultation Only'].map(option => (
                  <Badge
                    key={option}
                    variant={filters.availability.includes(option) ? "default" : "outline"}
                    className="cursor-pointer font-roboto"
                    onClick={() => {
                      if (filters.availability.includes(option)) {
                        removeFilter('availability', option);
                      } else {
                        addFilter('availability', option);
                      }
                    }}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        </>
      )}
    </div>
  );
}