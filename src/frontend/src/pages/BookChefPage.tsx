import React, { useState } from 'react';
import { useActor } from '../hooks/useActor';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function BookChefPage() {
  const { actor } = useActor();
  const navigate = useNavigate();

  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [eventDetails, setEventDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventDate || !location.trim() || !eventDetails.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!actor) {
      toast.error('Please wait for connection to be established');
      return;
    }

    setIsSubmitting(true);

    try {
      const dateTimestamp = BigInt(new Date(eventDate).getTime() * 1000000);
      const price = BigInt(0); // Price can be set by admin or negotiated

      await actor.createChefBooking(dateTimestamp, location.trim(), eventDetails.trim(), price);

      toast.success('Booking request submitted successfully!');
      navigate({ to: '/bookings' });
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to submit booking request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Book Our Chef</h1>
        <p className="text-muted-foreground">
          Hire our chef for your home parties, events, and special occasions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Tell us about your event and we'll get back to you</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="eventDate">
                <Calendar className="inline h-4 w-4 mr-2" />
                Event Date *
              </Label>
              <Input
                id="eventDate"
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="inline h-4 w-4 mr-2" />
                Event Location *
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter the event address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDetails">
                <FileText className="inline h-4 w-4 mr-2" />
                Event Details *
              </Label>
              <Textarea
                id="eventDetails"
                value={eventDetails}
                onChange={(e) => setEventDetails(e.target.value)}
                placeholder="Tell us about your event: number of guests, type of cuisine preferred, any special requirements..."
                rows={6}
                required
              />
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> After submitting your request, our chef will review the details and get
                back to you with pricing and availability. You'll be able to track your booking status in the
                Bookings page.
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/bookings' })}
              >
                View My Bookings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
