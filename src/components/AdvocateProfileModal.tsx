"use client";

import { useState } from "react";
import { 
  Star, 
  MapPin, 
  Briefcase, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  Clock,
  CheckCircle,
  ExternalLink 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Advocate } from "../types/advocate";
import { formatPhoneNumber } from "../utils/formatPhone";
import LazyImage from "./LazyImage";

interface AdvocateProfileModalProps {
  advocate: Advocate | null;
  isOpen: boolean;
  onClose: () => void;
  onBookConsultation?: (advocate: Advocate) => void;
}

export default function AdvocateProfileModal({
  advocate,
  isOpen,
  onClose,
  onBookConsultation
}: AdvocateProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'reviews'>('overview');

  if (!advocate) return null;

  // Generate a rating between 4.0 and 5.0 based on experience
  const rating = Math.min(5.0, 4.0 + (advocate.yearsOfExperience / 25));
  const ratingStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const reviewCount = Math.floor(Math.random() * 50) + 10;

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

  // Generate mock data for enhanced profile
  const languages = ['English', 'Spanish', 'French'].slice(0, Math.floor(Math.random() * 3) + 1);
  const certifications = [
    'Board Certified',
    'State Bar Member',
    'Pro Bono Award',
    'Client Choice Award'
  ].slice(0, Math.floor(Math.random() * 3) + 1);

  const hourlyRate = Math.floor(Math.random() * 300) + 200; // $200-$500

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">
            {advocate.firstName} {advocate.lastName} Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="relative">
                <LazyImage
                  src={advocate.profileImageUrl}
                  alt={`${advocate.firstName} ${advocate.lastName}`}
                  width={120}
                  height={120}
                  className="rounded-lg object-cover border-2 border-border"
                />
                <div className="absolute -bottom-2 -right-2 bg-background border rounded-full p-2">
                  <Award className="h-4 w-4 text-primary" />
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-h2 font-bold">
                  {advocate.firstName} {advocate.lastName}
                </h2>
                <p className="text-body-lg text-muted-foreground">{advocate.degree}</p>
                
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-body">{advocate.city}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-body">{advocate.yearsOfExperience} years experience</span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < ratingStars
                          ? 'text-yellow-400 fill-current'
                          : i === ratingStars && hasHalfStar
                          ? 'text-yellow-400 fill-current opacity-50'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-body font-medium">
                  {rating.toFixed(1)} ({reviewCount} reviews)
                </span>
              </div>

              {/* Availability and Rate */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={getAvailabilityColor(availability)} className="flex items-center gap-1 font-roboto">
                  <Clock className="h-3 w-3" />
                  {availability}
                </Badge>
                <Badge variant="outline">
                  ${hourlyRate}/hour
                </Badge>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => onBookConsultation?.(advocate)}
                >
                  <Calendar className="h-4 w-4" />
                  Book Consultation
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {formatPhoneNumber(advocate.phoneNumber)}
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'experience', label: 'Experience' },
                { id: 'reviews', label: 'Reviews' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 text-body font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* About */}
                  <Card>
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-body leading-relaxed">
                        {advocate.bio || `${advocate.firstName} ${advocate.lastName} is an experienced legal professional with ${advocate.yearsOfExperience} years of practice. Specializing in ${advocate.specialties.slice(0, 2).join(' and ')}, they have built a reputation for providing exceptional legal services to clients.`}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Specialties */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Areas of Practice</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {advocate.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-body-sm">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  {/* Quick Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Experience</span>
                        <span>{advocate.yearsOfExperience} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location</span>
                        <span>{advocate.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rate</span>
                        <span>${hourlyRate}/hour</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rating</span>
                        <span>{rating.toFixed(1)}/5.0</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Languages */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Languages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {languages.map((language, index) => (
                          <Badge key={index} variant="outline">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Certifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Certifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {certifications.map((cert, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-body-sm">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'experience' && (
              <Card>
                <CardHeader>
                  <CardTitle>Professional Experience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="border-l-2 border-primary pl-4">
                      <h4 className="font-semibold">Senior Partner</h4>
                      <p className="text-muted-foreground text-body-sm">Law Firm Name • 2018 - Present</p>
                      <p className="text-body-sm mt-2">
                        Leading practice in {advocate.specialties[0]} with focus on complex litigation and client advocacy.
                      </p>
                    </div>
                    <div className="border-l-2 border-muted pl-4">
                      <h4 className="font-semibold">Associate Attorney</h4>
                      <p className="text-muted-foreground text-body-sm">Previous Firm • 2015 - 2018</p>
                      <p className="text-body-sm mt-2">
                        Developed expertise in {advocate.specialties.slice(0, 2).join(' and ')} representing diverse clientele.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold">Client {index + 1}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-body-sm text-muted-foreground">
                            {new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-body">
                        "Excellent legal representation. Professional, knowledgeable, and achieved great results for my case. Highly recommended!"
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}