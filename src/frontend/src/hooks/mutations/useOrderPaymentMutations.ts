import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { OrderStatus } from '../../backend';
import { toast } from 'sonner';

export function useUpdateOrderPaymentRef() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      paymentRef,
      newStatus,
    }: {
      orderId: bigint;
      paymentRef: string;
      newStatus: OrderStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderPaymentRef(orderId, paymentRef, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update payment: ${error.message}`);
    },
  });
}
