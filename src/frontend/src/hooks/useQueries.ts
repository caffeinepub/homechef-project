import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { MenuItem, Order, ChefBooking, DashboardMetrics } from '../backend';

// Admin Check
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const principalString = identity?.getPrincipal().toString() || 'anonymous';

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin', principalString],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 0, // Always refetch to ensure fresh admin status
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

// Menu Queries
export function useGetMenuCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['menuCategories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMenuCategories();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000, // 5 minutes - menu categories rarely change
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: 3,
  });
}

export function useGetAllAvailableMenuItems() {
  const { actor, isFetching } = useActor();

  return useQuery<MenuItem[]>({
    queryKey: ['availableMenuItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAvailableMenuItems();
    },
    enabled: !!actor && !isFetching,
    staleTime: 2 * 60 * 1000, // 2 minutes - menu items can change but not frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: 3,
  });
}

export function useGetAllMenuItems() {
  const { actor, isFetching } = useActor();

  return useQuery<MenuItem[]>({
    queryKey: ['allMenuItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMenuItems();
    },
    enabled: !!actor && !isFetching,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
  });
}

// Orders Queries
export function useGetOrdersByUser() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['userOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrdersByUser();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

export function useGetOrder(orderId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Order | null>({
    queryKey: ['order', orderId?.toString()],
    queryFn: async () => {
      if (!actor || !orderId) return null;
      return actor.getOrder(orderId);
    },
    enabled: !!actor && !isFetching && orderId !== null,
    refetchInterval: 3000, // Poll every 3 seconds for real-time updates
  });
}

// Bookings Queries
export function useGetBookingsByUser() {
  const { actor, isFetching } = useActor();

  return useQuery<ChefBooking[]>({
    queryKey: ['userBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBookingsByUser();
    },
    enabled: !!actor && !isFetching,
  });
}

// Dashboard Queries
export function useGetDashboardMetrics() {
  const { actor, isFetching } = useActor();

  return useQuery<DashboardMetrics>({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDashboardMetrics();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000, // Refresh every 15 seconds
  });
}

// Stripe Configuration
export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isStripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

// Cash on Delivery Configuration
export function useGetAcceptsCashOnDelivery() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['acceptsCashOnDelivery'],
    queryFn: async () => {
      if (!actor) return true; // Default to true
      return actor.getAcceptsCashOnDelivery();
    },
    enabled: !!actor && !isFetching,
  });
}
