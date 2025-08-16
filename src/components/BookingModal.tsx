"use client";

import { useState } from "react";
import { Calendar, Clock, User, CheckCircle, X } from "lucide-react";
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

interface BookingModalProps {
  advocate: Advocate | null;
  isOpen: boolean;
  onClose: () => void;
}

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM", "5:00 PM"
];

const consultationTypes = [
  { type: "Initial Advocacy Session", duration: "60 min", price: 200 },
  { type: "Follow-up Meeting", duration: "30 min", price: 150 },
  { type: "Records Review", duration: "45 min", price: 175 },
  { type: "Healthcare Strategy Session", duration: "90 min", price: 275 }
];

export default function BookingModal({ advocate, isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState<'type' | 'date' | 'time' | 'confirm'>('type');
  const [selectedType, setSelectedType] = useState<typeof consultationTypes[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isBooked, setIsBooked] = useState(false);

  if (!advocate) return null;

  // Generate next 14 days for booking
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Skip weekends for this demo
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push({
          date: date.toISOString().split('T')[0],
          display: date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  const handleBooking = () => {
    // Simulate booking process
    setIsBooked(true);
    setTimeout(() => {
      setIsBooked(false);
      setStep('type');
      setSelectedType(null);
      setSelectedDate('');
      setSelectedTime('');
      onClose();
    }, 3000);
  };

  const resetAndClose = () => {
    setStep('type');
    setSelectedType(null);
    setSelectedDate('');
    setSelectedTime('');
    setIsBooked(false);
    onClose();
  };

  const canProceedToNext = () => {
    switch (step) {
      case 'type': return selectedType !== null;
      case 'date': return selectedDate !== '';
      case 'time': return selectedTime !== '';
      default: return false;
    }
  };

  if (isBooked) {
    return (
      <Dialog open={isOpen} onOpenChange={resetAndClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-h2 font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-body text-muted-foreground mb-4">
              Your {selectedType?.type} with {advocate.firstName} {advocate.lastName} 
              has been scheduled for {selectedDate} at {selectedTime}.
            </p>
            <p className="text-body-sm text-muted-foreground">
              You will receive a confirmation email shortly with meeting details.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-primary" />
            Book Consultation
          </DialogTitle>
        </DialogHeader>

        {/* Advocate Info */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <LazyImage
                src={advocate.profileImageUrl}
                alt={`${advocate.firstName} ${advocate.lastName}`}
                width={60}
                height={60}
                className="rounded-full object-cover border-2 border-border"
              />
              <div>
                <h3 className="font-semibold">{advocate.firstName} {advocate.lastName}</h3>
                <p className="text-body-sm text-muted-foreground">{advocate.degree}</p>
                <p className="text-body-sm text-muted-foreground">{advocate.city}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Consultation Type */}
        {step === 'type' && (
          <div className="space-y-4">
            <h3 className="text-h3 font-semibold">Select Consultation Type</h3>
            <div className="grid gap-3">
              {consultationTypes.map((type, index) => (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-colors ${
                    selectedType?.type === type.type ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedType(type)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{type.type}</h4>
                        <p className="text-body-sm text-muted-foreground">{type.duration}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${type.price}</div>
                        <Badge variant="outline" className="text-xs">{type.duration}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date Selection */}
        {step === 'date' && (
          <div className="space-y-4">
            <h3 className="text-h3 font-semibold">Select Date</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {availableDates.map((date) => (
                <Button
                  key={date.date}
                  variant={selectedDate === date.date ? "default" : "outline"}
                  className="h-auto p-3 flex flex-col"
                  onClick={() => setSelectedDate(date.date)}
                >
                  <span className="text-sm">{date.display}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Time Selection */}
        {step === 'time' && (
          <div className="space-y-4">
            <h3 className="text-h3 font-semibold">Select Time</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 'confirm' && (
          <div className="space-y-6">
            <h3 className="text-h3 font-semibold">Confirm Booking</h3>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-h4">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Consultation Type:</span>
                  <span className="font-medium">{selectedType?.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{selectedType?.duration}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold">${selectedType?.price}</span>
                </div>
              </CardContent>
            </Card>

            <div className="bg-primary/10 border border-primary/20 rounded-md p-4">
              <p className="text-body-sm text-foreground/80">
                <strong>Note:</strong> You will receive a confirmation email with meeting details and 
                payment instructions. Cancellations must be made at least 24 hours in advance.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex gap-2">
            {step !== 'type' && (
              <Button 
                variant="outline" 
                onClick={() => {
                  if (step === 'date') setStep('type');
                  else if (step === 'time') setStep('date');
                  else if (step === 'confirm') setStep('time');
                }}
              >
                Back
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={resetAndClose}>
              Cancel
            </Button>
            {step === 'confirm' ? (
              <Button onClick={handleBooking}>
                Confirm Booking
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  if (step === 'type') setStep('date');
                  else if (step === 'date') setStep('time');
                  else if (step === 'time') setStep('confirm');
                }}
                disabled={!canProceedToNext()}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}