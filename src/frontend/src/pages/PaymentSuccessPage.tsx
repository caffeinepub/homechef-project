import React, { useEffect, useState } from 'react';
import { useActor } from '../hooks/useActor';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const { actor } = useActor();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processPayment = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      const pendingOrderId = sessionStorage.getItem('pendingOrderId');

      if (!sessionId || !actor) {
        setIsProcessing(false);
        return;
      }

      try {
        const sessionStatus = await actor.getStripeSessionStatus(sessionId);

        if ('completed' in sessionStatus && pendingOrderId) {
          // Update order with Stripe payment reference
          await actor.updateOrderPaymentRef(
            BigInt(pendingOrderId),
            `STRIPE_${sessionId}`,
            { __kind__: 'confirmed', confirmed: null }
          );
          sessionStorage.removeItem('pendingOrderId');
        }
      } catch (error) {
        console.error('Payment processing error:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [actor]);

  return (
    <div className="container py-16 max-w-md mx-auto">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            {isProcessing
              ? 'Processing your payment...'
              : 'Your payment was successful and your order has been confirmed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Our chef will start preparing your food. You can track your order status in the Orders page.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate({ to: '/orders' })}>View My Orders</Button>
            <Button variant="outline" onClick={() => navigate({ to: '/menu' })}>
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
