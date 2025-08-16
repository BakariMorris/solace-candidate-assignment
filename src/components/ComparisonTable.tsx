"use client";

import { Star, MapPin, Briefcase, Phone, Mail, Calendar, Award, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Advocate } from "../types/advocate";
import { formatPhoneNumber } from "../utils/formatPhone";
import { useComparisonStore } from "../store/useComparisonStore";
import LazyImage from "./LazyImage";

interface ComparisonTableProps {
  advocates: Advocate[];
}

export default function ComparisonTable({ advocates }: ComparisonTableProps) {
  const { removeFromComparison } = useComparisonStore();

  if (advocates.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-h3 font-semibold mb-2">No Advocates Selected</div>
          <p className="text-body text-muted-foreground">
            Add advocates to compare their qualifications and specialties side by side.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Generate ratings for each advocate
  const advocateData = advocates.map(advocate => {
    const rating = Math.min(5.0, 4.0 + (advocate.yearsOfExperience / 25));
    const availability = ['Available Now', 'Within 1 Week', 'Within 1 Month', 'Consultation Only'][(advocate.id || 0) % 4];
    const hourlyRate = Math.floor(Math.random() * 300) + 200;
    
    return {
      ...advocate,
      rating: rating.toFixed(1),
      availability,
      hourlyRate
    };
  });

  const comparisonFields = [
    { label: "Photo", key: "photo" },
    { label: "Name", key: "name" },
    { label: "Degree", key: "degree" },
    { label: "Location", key: "city" },
    { label: "Experience", key: "yearsOfExperience" },
    { label: "Rating", key: "rating" },
    { label: "Availability", key: "availability" },
    { label: "Rate", key: "hourlyRate" },
    { label: "Specialties", key: "specialties" },
    { label: "Contact", key: "contact" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <td className="w-32 p-4 border-b font-semibold bg-muted/50">
              Criteria
            </td>
            {advocateData.map((advocate) => (
              <td key={advocate.id} className="p-4 border-b border-l bg-background relative min-w-64">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 p-1 h-6 w-6 text-gray-400 hover:text-gray-600"
                  onClick={() => advocate.id && removeFromComparison(advocate.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparisonFields.map((field) => (
            <tr key={field.key} className="border-b">
              <td className="p-4 font-medium bg-muted/30 w-32">
                {field.label}
              </td>
              {advocateData.map((advocate) => (
                <td key={advocate.id} className="p-4 border-l">
                  {field.key === "photo" && (
                    <div className="flex justify-center">
                      <LazyImage
                        src={advocate.profileImageUrl}
                        alt={`${advocate.firstName} ${advocate.lastName}`}
                        width={60}
                        height={60}
                        className="rounded-full object-cover border-2 border-border"
                      />
                    </div>
                  )}
                  
                  {field.key === "name" && (
                    <div className="text-center">
                      <div className="font-semibold">
                        {advocate.firstName} {advocate.lastName}
                      </div>
                    </div>
                  )}
                  
                  {field.key === "degree" && (
                    <div className="text-center">{advocate.degree}</div>
                  )}
                  
                  {field.key === "city" && (
                    <div className="text-center flex items-center justify-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {advocate.city}
                    </div>
                  )}
                  
                  {field.key === "yearsOfExperience" && (
                    <div className="text-center flex items-center justify-center gap-1">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      {advocate.yearsOfExperience} years
                    </div>
                  )}
                  
                  {field.key === "rating" && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(parseFloat(advocate.rating))
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {advocate.rating}/5.0
                      </div>
                    </div>
                  )}
                  
                  {field.key === "availability" && (
                    <div className="text-center">
                      <Badge variant="outline" className="text-xs font-roboto">
                        {advocate.availability}
                      </Badge>
                    </div>
                  )}
                  
                  {field.key === "hourlyRate" && (
                    <div className="text-center font-semibold">
                      ${advocate.hourlyRate}/hour
                    </div>
                  )}
                  
                  {field.key === "specialties" && (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {advocate.specialties.slice(0, 8).map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs mr-1">
                          {specialty}
                        </Badge>
                      ))}
                      {advocate.specialties.length > 8 && (
                        <div className="text-xs text-muted-foreground text-center mt-1">
                          +{advocate.specialties.length - 8} more
                        </div>
                      )}
                    </div>
                  )}
                  
                  {field.key === "contact" && (
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Button>
                      <Button variant="default" size="sm" className="w-full text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        Book
                      </Button>
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}