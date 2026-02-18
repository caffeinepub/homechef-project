import { useMutation } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { ShoppingItem } from '../../backend';

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      
      // Check if Cash on Delivery only mode is enabled
      const acceptsCashOnDelivery = await actor.getAcceptsCashOnDelivery();
      if (acceptsCashOnDelivery) {
        throw new Error('Only Cash on Delivery is supported at this time. Please use the Cash on Delivery payment option.');
      }
      
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      
      try {
        const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
        const session = JSON.parse(result) as CheckoutSession;
        
        if (!session?.url || session.url.trim() === '') {
          throw new Error('Payment session URL is missing. Please try again or contact support.');
        }
        
        return session;
      } catch (error: any) {
        // Check for IC0504 out-of-cycles error
        if (error.message && error.message.includes('IC0504')) {
          throw new Error('Service temporarily unavailable - the payment system needs to be topped up with cycles. Please try again later or contact support.');
        }
        
        // Check for backend trap about digital payments
        if (error.message && error.message.includes('Digital payments are not available')) {
          throw new Error('Only Cash on Delivery is supported at this time. Please use the Cash on Delivery payment option.');
        }
        
        throw error;
      }
    },
  });
}
