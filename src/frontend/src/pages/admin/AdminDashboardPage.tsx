import React from 'react';
import { useGetDashboardMetrics } from '../../hooks/useQueries';
import { useUpdateOrderStatus } from '../../hooks/mutations/useOrderAdminMutations';
import { useUpdateBookingStatus } from '../../hooks/mutations/useBookingAdminMutations';
import KpiCard from '../../components/admin/KpiCard';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import BookingStatusBadge from '../../components/bookings/BookingStatusBadge';
import PaymentSetup from '../../components/payments/PaymentSetup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, Package, Clock, Calendar } from 'lucide-react';
import type { OrderStatus, BookingStatus } from '../../backend';

export default function AdminDashboardPage() {
  const { data: metrics, isLoading } = useGetDashboardMetrics();
  const updateOrderStatus = useUpdateOrderStatus();
  const updateBookingStatus = useUpdateBookingStatus();

  const handleOrderStatusChange = (orderId: bigint, newStatus: string) => {
    let status: OrderStatus;
    switch (newStatus) {
      case 'confirmed':
        status = { __kind__: 'confirmed', confirmed: null };
        break;
      case 'inProgress':
        status = { __kind__: 'inProgress', inProgress: null };
        break;
      case 'outForDelivery':
        status = { __kind__: 'outForDelivery', outForDelivery: null };
        break;
      case 'completed':
        status = { __kind__: 'completed', completed: null };
        break;
      case 'rejected':
        status = { __kind__: 'rejected', rejected: { reason: 'Rejected by admin' } };
        break;
      default:
        return;
    }
    updateOrderStatus.mutate({ orderId, newStatus: status });
  };

  const handleBookingStatusChange = (bookingId: bigint, newStatus: string) => {
    let status: BookingStatus;
    switch (newStatus) {
      case 'confirmed':
        status = { __kind__: 'confirmed', confirmed: null };
        break;
      case 'rejected':
        status = { __kind__: 'rejected', rejected: { reason: 'Rejected by admin' } };
        break;
      default:
        return;
    }
    updateBookingStatus.mutate({ bookingId, newStatus: status });
  };

  if (isLoading) {
    return (
      <div className="container py-16">
        <p className="text-center text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="container py-16">
        <p className="text-center text-muted-foreground">Failed to load dashboard metrics</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <PaymentSetup />

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage orders, bookings, and menu items</p>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Total Orders"
          value={metrics.totalOrders.toString()}
          icon={Package}
          description="All time"
        />
        <KpiCard
          title="Total Revenue"
          value={`$${(Number(metrics.totalRevenue) / 100).toFixed(2)}`}
          icon={DollarSign}
          description="From completed orders"
        />
        <KpiCard
          title="Pending Orders"
          value={metrics.pendingOrders.length}
          icon={Clock}
          description="Require attention"
        />
        <KpiCard
          title="Pending Bookings"
          value={metrics.pendingBookings.length}
          icon={Calendar}
          description="Awaiting approval"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from customers</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {metrics.recentOrders.map((order) => (
                  <div key={order.id.toString()} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Order #{order.id.toString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(Number(order.createdAt) / 1000000).toLocaleString()}
                        </p>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>

                    <div className="text-sm">
                      <p className="font-medium">${(Number(order.totalAmount) / 100).toFixed(2)}</p>
                      <p className="text-muted-foreground">{order.items.length} items</p>
                    </div>

                    <Select
                      onValueChange={(value) => handleOrderStatusChange(order.id, value)}
                      disabled={updateOrderStatus.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirm Order</SelectItem>
                        <SelectItem value="inProgress">Mark In Progress</SelectItem>
                        <SelectItem value="outForDelivery">Out for Delivery</SelectItem>
                        <SelectItem value="completed">Mark Completed</SelectItem>
                        <SelectItem value="rejected">Reject Order</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Chef Booking Requests</CardTitle>
            <CardDescription>Pending booking approvals</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.pendingBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No pending bookings</p>
            ) : (
              <div className="space-y-4">
                {metrics.pendingBookings.map((booking) => (
                  <div key={booking.id.toString()} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Booking #{booking.id.toString()}</p>
                        <p className="text-sm text-muted-foreground">
                          Event: {new Date(Number(booking.eventDate) / 1000000).toLocaleString()}
                        </p>
                      </div>
                      <BookingStatusBadge status={booking.status} />
                    </div>

                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-medium">Location:</span> {booking.location}
                      </p>
                      <p className="text-muted-foreground line-clamp-2">{booking.eventDetails}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleBookingStatusChange(booking.id, 'confirmed')}
                        disabled={updateBookingStatus.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleBookingStatusChange(booking.id, 'rejected')}
                        disabled={updateBookingStatus.isPending}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => (window.location.href = '/admin/menu')}>Manage Menu</Button>
              <Button variant="outline" onClick={() => (window.location.href = '/menu')}>
                View Public Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
