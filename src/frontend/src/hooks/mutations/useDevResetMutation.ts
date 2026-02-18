import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import { useCart } from '../../cart/CartProvider';
import { toast } from 'sonner';

export function useDevReset() {
  const { actor } = useActor();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { clearCart } = useCart();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // Note: The backend doesn't have a devReset method yet
      // This is a placeholder that will need backend implementation
      throw new Error('Dev reset functionality is not yet implemented in the backend');
    },
    onSuccess: async () => {
      // Clear all client-side state
      queryClient.clear();
      sessionStorage.clear();
      clearCart();
      
      // Log out the user
      await clear();
      
      // Navigate to home
      window.location.href = '/';
      
      toast.success('Application data has been reset');
    },
    onError: (error: any) => {
      console.error('Dev reset error:', error);
      toast.error(error.message || 'Failed to reset application data');
    },
  });
}
