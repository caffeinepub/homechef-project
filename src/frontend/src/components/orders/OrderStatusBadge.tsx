import React from 'react';
import type { OrderStatus } from '../../backend';
import { Badge } from '@/components/ui/badge';

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getStatusInfo = () => {
    if ('pendingPayment' in status) {
      return { label: 'Pending Payment', variant: 'secondary' as const };
    }
    if ('paymentFailed' in status) {
      return { label: 'Payment Failed', variant: 'destructive' as const };
    }
    if ('confirmed' in status) {
      return { label: 'Confirmed', variant: 'default' as const };
    }
    if ('rejected' in status) {
      return { label: `Rejected: ${status.rejected.reason}`, variant: 'destructive' as const };
    }
    if ('inProgress' in status) {
      return { label: 'In Progress', variant: 'default' as const };
    }
    if ('outForDelivery' in status) {
      return { label: 'Out for Delivery', variant: 'default' as const };
    }
    if ('completed' in status) {
      return { label: 'Completed', variant: 'outline' as const };
    }
    if ('cancelled' in status) {
      return { label: `Cancelled: ${status.cancelled.reason}`, variant: 'secondary' as const };
    }
    return { label: 'Unknown', variant: 'secondary' as const };
  };

  const { label, variant } = getStatusInfo();

  return <Badge variant={variant}>{label}</Badge>;
}
