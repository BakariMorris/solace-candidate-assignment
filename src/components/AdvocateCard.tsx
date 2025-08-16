"use client";

import { useState } from "react";
import { Star, MapPin, Briefcase, Phone, Mail, Calendar, Award, Heart, Scale, Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Advocate } from "../types/advocate";
import { formatPhoneNumber } from "../utils/formatPhone";
import { useFavoritesStore } from "../store/useFavoritesStore";
import { useComparisonStore } from "../store/useComparisonStore";
import { useSearchStore } from "../store/useSearchStore";
import { HighlightText } from "../utils/highlightText";
import LazyImage from "./LazyImage";
import { userAnalytics } from "../lib/user-analytics";

interface AdvocateCardProps {
  advocate: Advocate;
  onViewProfile?: (advocate: Advocate) => void;
  onBookConsultation?: (advocate: Advocate) => void;
}

export default function AdvocateCard({ advocate, onViewProfile, onBookConsultation }: AdvocateCardProps) {
  const [imageError, setImageError] = useState(false);
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const { addToComparison, removeFromComparison, isInComparison, canAddMore } = useComparisonStore();
  const { searchTerm } = useSearchStore();

  // Generate a rating between 4.0 and 5.0 based on experience
  const rating = Math.min(5.0, 4.0 + (advocate.yearsOfExperience / 25));
  const ratingStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  const isAdvocateFavorite = advocate.id ? isFavorite(advocate.id) : false;
  const isInComparisonList = advocate.id ? isInComparison(advocate.id) : false;

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!advocate.id) return;
    
    if (isAdvocateFavorite) {
      removeFavorite(advocate.id);
      userAnalytics.trackEvent('favorite_removed', 'interaction', 'remove_favorite', undefined, advocate.id);
    } else {
      addFavorite(advocate);
      userAnalytics.trackFavoriteAdded(advocate.id);
    }
  };

  const handleComparisonToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!advocate.id) return;
    
    if (isInComparisonList) {
      removeFromComparison(advocate.id);
      userAnalytics.trackEvent('comparison_removed', 'interaction', 'remove_comparison', undefined, advocate.id);
    } else if (canAddMore()) {
      addToComparison(advocate);
      userAnalytics.trackEvent('comparison_added', 'interaction', 'add_comparison', undefined, advocate.id);
    }
  };

  // Generate availability status
  const availabilityOptions = ['Available Now', 'Within 1 Week', 'Within 1 Month', 'Consultation Only'];
  const availability = availabilityOptions[(advocate.id || 0) % availabilityOptions.length];
  
  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'Available Now': return 'default';
      case 'Within 1 Week': return 'secondary';
      case 'Within 1 Month': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card className="card-flat interactive-hover cursor-pointer group relative" onClick={() => onViewProfile?.(advocate)}>
      {/* Action Buttons */}
      <div className="absolute top-4 right-3 z-10 flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={`p-2 h-8 w-8 transition-all duration-200 ${isInComparisonList ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'hover:bg-accent'}`}
          onClick={handleComparisonToggle}
          disabled={!isInComparisonList && !canAddMore()}
          title={isInComparisonList ? "Remove from comparison" : "Add to comparison"}
        >
          {isInComparisonList ? (
            <Check className="h-4 w-4 text-primary-foreground" />
          ) : (
            <Scale className={`h-4 w-4 transition-colors ${canAddMore() ? 'text-gray-400 hover:text-primary' : 'text-gray-300'}`} />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`p-2 h-8 w-8 transition-all duration-200 ${isAdvocateFavorite ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'hover:bg-accent'}`}
          onClick={handleFavoriteToggle}
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${isAdvocateFavorite ? 'fill-current text-primary-foreground' : 'text-gray-400 hover:text-primary'}`}
          />
        </Button>
      </div>
      
      <CardHeader className="pb-4">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <LazyImage
              src={advocate.profileImageUrl}
              alt={`${advocate.firstName} ${advocate.lastName}`}
              width={80}
              height={80}
              className="rounded-full object-cover border-2 border-border"
            />
            <div className="absolute -bottom-1 -right-1 bg-background border rounded-full p-1">
              <Award className="h-3 w-3 text-primary" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0 pr-20">
            {/* Name gets its own full row */}
            <h3 className="text-h4 font-semibold mb-1">
              <HighlightText 
                text={`${advocate.firstName} ${advocate.lastName}`}
                searchTerm={searchTerm}
              />
            </h3>
            
            {/* Degree and availability badge on second row */}
            <div className="flex items-center justify-between">
              <p className="text-body text-muted-foreground truncate">
                <HighlightText 
                  text={advocate.degree}
                  searchTerm={searchTerm}
                />
              </p>
              <Badge variant={getAvailabilityColor(availability)} className="ml-2 shrink-0 font-roboto">
                {availability}
              </Badge>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < ratingStars
                        ? 'text-yellow-400 fill-current'
                        : i === ratingStars && hasHalfStar
                        ? 'text-yellow-400 fill-current opacity-50'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-body-sm text-muted-foreground">
                {rating.toFixed(1)} ({Math.floor(Math.random() * 50) + 10} reviews)
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location and Experience */}
        <div className="flex items-center justify-between text-body-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <HighlightText 
              text={advocate.city}
              searchTerm={searchTerm}
            />
          </div>
          <div className="flex items-center space-x-1">
            <Briefcase className="h-4 w-4" />
            <span>{advocate.yearsOfExperience} years exp.</span>
          </div>
        </div>

        {/* Specialties */}
        <div>
          <h4 className="text-body-sm font-medium mb-2">Specialties</h4>
          <div className="flex flex-wrap gap-1">
            {advocate.specialties.slice(0, 3).map((specialty, index) => (
              <Badge key={index} variant="outline" className="text-caption">
                <HighlightText 
                  text={specialty}
                  searchTerm={searchTerm}
                />
              </Badge>
            ))}
            {advocate.specialties.length > 3 && (
              <Badge variant="outline" className="text-caption">
                +{advocate.specialties.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Bio Preview */}
        {advocate.bio && (
          <div>
            <p className="text-body-sm text-muted-foreground line-clamp-2">
              {advocate.bio}
            </p>
          </div>
        )}

        {/* Contact Actions */}
        <div className="flex items-center space-x-2 pt-2 border-t">
          <Button variant="outline" size="sm" className="flex-1">
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onBookConsultation?.(advocate);
            }}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Book
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}