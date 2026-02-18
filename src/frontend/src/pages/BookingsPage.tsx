import React from 'react';
import { useGetBookingsByUser } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BookingStatusBadge from '../components/bookings/BookingStatusBadge';
import { Calendar } from 'lucide-react';

export default function BookingsPage() {
  const { data: bookings = [], isLoading } = useGetBookingsByUser();

  if (isLoading) {
    return (
      <div className="container py-16">
        <p className="text-center text-muted-foreground">Loading your bookings...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="container py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle>No bookings yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Your chef booking requests will appear here</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedBookings = [...bookings].sort((a, b) => Number(b.createdAt - a.createdAt));

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Your Bookings</h1>

      <div className="space-y-4">
        {sortedBookings.map((booking) => (
          <Card key={booking.id.toString()}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">Booking #{booking.id.toString()}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Requested: {new Date(Number(booking.createdAt) / 1000000).toLocaleString()}
                  </p>
                </div>
                <BookingStatusBadge status={booking.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Event Date:</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(Number(booking.eventDate) / 1000000).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Location:</p>
                  <p className="text-sm text-muted-foreground">{booking.location}</p>
                </div>

                <div>
                  <p className="text-sm font-medium">Event Details:</p>
                  <p className="text-sm text-muted-foreground">{booking.eventDetails}</p>
                </div>

                {booking.price > 0n && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-medium">Price:</span>
                    <span className="text-lg font-bold">${(Number(booking.price) / 100).toFixed(2)}</span>
                  </div>
                )}

                {booking.paymentReference && (
                  <div className="text-xs text-muted-foreground">
                    Payment Ref: {booking.paymentReference}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
