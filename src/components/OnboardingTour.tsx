"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, X, Search, Filter, Heart, Scale, User } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  icon: React.ReactNode;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Advocate Search',
    description: 'Find the perfect advocate for your needs. Let us show you around!',
    target: '.container',
    position: 'bottom',
    icon: <User className="h-5 w-5" />
  },
  {
    id: 'search',
    title: 'Search for Advocates',
    description: 'Use the search bar to find advocates by name, specialty, location, or experience.',
    target: '[data-tour="search"]',
    position: 'bottom',
    icon: <Search className="h-5 w-5" />
  },
  {
    id: 'filters',
    title: 'Advanced Filters',
    description: 'Click here to filter by specialty, location, experience level, and availability.',
    target: '[data-tour="filters"]',
    position: 'bottom',
    icon: <Filter className="h-5 w-5" />
  },
  {
    id: 'favorites',
    title: 'Save Favorites',
    description: 'Click the heart icon on any advocate card to save them to your favorites.',
    target: '[data-tour="favorites-nav"]',
    position: 'bottom',
    icon: <Heart className="h-5 w-5" />
  },
  {
    id: 'compare',
    title: 'Compare Advocates',
    description: 'Use the scale icon to add advocates to comparison (up to 4) and compare them side by side.',
    target: '[data-tour="compare-nav"]',
    position: 'bottom',
    icon: <Scale className="h-5 w-5" />
  }
];

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingTour({ isOpen, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM elements are rendered
      setTimeout(() => setIsVisible(true), 500);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const currentTourStep = tourSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
      setCurrentStep(0);
    }, 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => {
      onSkip();
      setCurrentStep(0);
    }, 300);
  };

  if (!isOpen || !isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" />
      
      {/* Tour Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md card-elevated">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {currentTourStep.icon}
                </div>
                <div>
                  <CardTitle className="text-h4">{currentTourStep.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-body-sm text-muted-foreground">
                      Step {currentStep + 1} of {tourSteps.length}
                    </span>
                    <div className="flex gap-1">
                      {tourSteps.map((_, index) => (
                        <div
                          key={index}
                          className={`h-1.5 w-6 rounded-full transition-colors ${
                            index <= currentStep ? 'bg-primary' : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSkip}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <p className="text-body text-muted-foreground">
              {currentTourStep.description}
            </p>

            {/* Special content for specific steps */}
            {currentStep === 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-body-sm">
                  <Search className="h-4 w-4 text-primary" />
                  <span>Search and filter advocates</span>
                </div>
                <div className="flex items-center gap-2 text-body-sm">
                  <Heart className="h-4 w-4 text-primary" />
                  <span>Save your favorite advocates</span>
                </div>
                <div className="flex items-center gap-2 text-body-sm">
                  <Scale className="h-4 w-4 text-primary" />
                  <span>Compare advocates side by side</span>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleSkip}>
                  Skip Tour
                </Button>
                {currentStep > 0 && (
                  <Button variant="outline" onClick={handlePrevious}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                )}
              </div>
              
              <Button onClick={handleNext}>
                {currentStep === tourSteps.length - 1 ? (
                  'Get Started'
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}