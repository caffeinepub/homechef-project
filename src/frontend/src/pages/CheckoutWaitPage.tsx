import React, { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useActor } from '../hooks/useActor';
import { useGetOrder, useGetAcceptsCashOnDelivery } from '../hooks/useQueries';
import { useCreateCheckoutSession } from '../hooks/payments/useCreateCheckoutSession';
import { useUpdateOrderPaymentRef } from '../hooks/mutations/useOrderPaymentMutations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, CheckCircle2, XCircle, Banknote, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { OrderStatus } from '../backend';

const POLLING_INTERVAL = 3000; // 3 seconds
const MAX_WAIT_TIME = 5 * 60 * 1000; // 5 minutes

export default function CheckoutWaitPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const searchParams = useSearch({ from: '/checkout-wait' });
  const orderId = searchParams?.orderId ? BigInt(searchParams.orderId) : null;

  const { data: order, refetch } = useGetOrder(orderId);
  const { data: acceptsCashOnDelivery } = useGetAcceptsCashOnDelivery();
  const createCheckoutSession = useCreateCheckoutSession();
  const updatePaymentRef = useUpdateOrderPaymentRef();

  const [waitStartTime] = useState(Date.now());
  const [isTimeout, setIsTimeout] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Poll for order status changes
  useEffect(() => {
    if (!orderId || isTimeout || showPaymentMethods) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - waitStartTime;
      
      if (elapsed >= MAX_WAIT_TIME) {
        setIsTimeout(true);
        clearInterval(interval);
        return;
      }

      refetch();
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [orderId, waitStartTime, isTimeout, showPaymentMethods, refetch]);

  // Check order status and transition
  useEffect(() => {
    if (!order) return;

    // Check if admin accepted (status changed from pendingPayment to confirmed)
    if (order.status.__kind__ === 'confirmed') {
      setShowPaymentMethods(true);
    }

    // Check if admin rejected
    if (order.status.__kind__ === 'rejected') {
      toast.error('Your order was rejected by the admin');
      navigate({ to: '/cart' });
    }

    // Check if cancelled
    if (order.status.__kind__ === 'cancelled') {
      toast.error('Your order was cancelled');
      navigate({ to: '/cart' });
    }
  }, [order, navigate]);

  const handleCashOnDelivery = async () => {
    if (!order) return;

    try {
      await updatePaymentRef.mutateAsync({
        orderId: order.id,
        paymentRef: 'CASH_ON_DELIVERY',
        newStatus: { __kind__: 'confirmed', confirmed: null },
      });

      toast.success('Order confirmed with Cash on Delivery');
      navigate({ to: '/orders' });
    } catch (error: any) {
      console.error('COD error:', error);
      toast.error(error.message || 'Failed to process Cash on Delivery');
    }
  };

  if (!orderId) {
    return (
      <div className="container py-16 max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Order</CardTitle>
            <CardDescription>No order ID provided</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/cart' })}>Return to Cart</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-16 max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Loading Order...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please wait while we load your order details.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show payment method selection after admin acceptance
  if (showPaymentMethods) {
    return (
      <div className="container py-16 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-center">Order Accepted!</CardTitle>
            <CardDescription className="text-center">
              Your order has been accepted by the admin. Please confirm your payment method to complete your order.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {checkoutError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{checkoutError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button
                className="w-full h-auto py-4 flex items-start gap-4"
                variant="outline"
                onClick={handleCashOnDelivery}
                disabled={updatePaymentRef.isPending}
              >
                <Banknote className="h-6 w-6 mt-1 flex-shrink-0" />
                <div className="text-left flex-1">
                  <div className="font-semibold">Cash on Delivery</div>
                  <div className="text-sm text-muted-foreground">
                    Pay with cash when your order is delivered
                  </div>
                </div>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Order Total:</span>
                <span className="font-bold text-lg">${(Number(order.totalAmount) / 100).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show timeout message
  if (isTimeout) {
    return (
      <div className="container py-16 max-w-md mx-auto">
        <Card className="border-destructive">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-center">Order Not Accepted</CardTitle>
            <CardDescription className="text-center">
              The admin did not accept your order within 5 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Your order is still pending. You can check its status in your orders page or try placing a new order.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate({ to: '/orders' })}>View My Orders</Button>
              <Button variant="outline" onClick={() => navigate({ to: '/cart' })}>
                Return to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show waiting state
  const elapsed = Date.now() - waitStartTime;
  const remainingSeconds = Math.max(0, Math.floor((MAX_WAIT_TIME - elapsed) / 1000));
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="container py-16 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <CardTitle className="text-2xl text-center">Waiting for Admin Acceptance</CardTitle>
          <CardDescription className="text-center">
            Your order has been submitted and is awaiting admin approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The admin will review and accept your order. This usually takes a few moments.
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Time remaining:</p>
            <p className="text-2xl font-bold">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </p>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Order #:</span>
              <span className="font-medium">{order.id.toString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-bold">${(Number(order.totalAmount) / 100).toFixed(2)}</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={() => navigate({ to: '/orders' })}>
            View All Orders
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
