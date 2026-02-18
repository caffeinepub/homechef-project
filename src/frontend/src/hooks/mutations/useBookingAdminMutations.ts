import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { toast } from 'sonner';
import type { BookingStatus } from '../../backend';

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { bookingId: bigint; newStatus: BookingStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBookingStatus(data.bookingId, data.newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
      toast.success('Booking status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update booking status: ${error.message}`);
    },
  });
}
