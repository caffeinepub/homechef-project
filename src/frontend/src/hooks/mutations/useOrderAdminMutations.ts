import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { toast } from 'sonner';
import type { OrderStatus } from '../../backend';

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { orderId: bigint; newStatus: OrderStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderStatus(data.orderId, data.newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      toast.success('Order status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update order status: ${error.message}`);
    },
  });
}
