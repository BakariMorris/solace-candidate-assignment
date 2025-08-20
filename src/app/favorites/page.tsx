"use client";

import { useState } from "react";
import { useFavoritesStore } from "../../store/useFavoritesStore";
import AdvocateCard from "../../components/AdvocateCard";
import AdvocateProfileModal from "../../components/AdvocateProfileModal";
import BookingModal from "../../components/BookingModal";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Heart, ArrowLeft, Users, Trash2 } from "lucide-react";
import { Advocate } from "../../types/advocate";
import Link from "next/link";

export default function FavoritesPage() {
  const { favorites, clearFavorites } = useFavoritesStore();
  const [selectedAdvocate, setSelectedAdvocate] = useState<Advocate | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [bookingAdvocate, setBookingAdvocate] = useState<Advocate | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleViewProfile = (advocate: Advocate) => {
    setSelectedAdvocate(advocate);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedAdvocate(null);
  };

  const handleBookConsultation = (advocate: Advocate) => {
    setBookingAdvocate(advocate);
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingAdvocate(null);
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to remove all favorites?")) {
      clearFavorites();
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Search
              </Button>
            </Link>
            <div>
              <h1 className="text-display flex items-center gap-3">
                <Heart className="h-8 w-8 text-primary fill-current" />
                My Favorite Healthcare Advocates
              </h1>
              <p className="text-body-lg text-muted-foreground">
                Healthcare advocates you've saved for easy access
              </p>
            </div>
          </div>
          
          {favorites.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearAll}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {favorites.length} Favorite{favorites.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Content */}
      {favorites.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-h3 font-semibold mb-2">No Favorites Yet</h2>
            <p className="text-body text-muted-foreground mb-6 max-w-md mx-auto">
              Start building your list of favorite healthcare advocates by clicking the heart icon on healthcare advocate cards.
            </p>
            <Link href="/">
              <Button>
                Browse Healthcare Advocates
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Favorites Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((advocate) => (
              <AdvocateCard
                key={advocate.id}
                advocate={advocate}
                onViewProfile={handleViewProfile}
                onBookConsultation={handleBookConsultation}
              />
            ))}
          </div>

          {/* Quick Actions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline">
                  Compare Selected
                </Button>
                <Button variant="outline">
                  Export List
                </Button>
                <Button variant="outline">
                  Share Favorites
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Profile Modal */}
      <AdvocateProfileModal
        advocate={selectedAdvocate}
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        onBookConsultation={handleBookConsultation}
        allAdvocates={favorites}
        onViewProfile={handleViewProfile}
      />

      {/* Booking Modal */}
      <BookingModal
        advocate={bookingAdvocate}
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
      />
    </main>
  );
}