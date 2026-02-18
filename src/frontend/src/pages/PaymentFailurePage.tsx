import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <div className="container py-16 max-w-md mx-auto">
      <Card className="text-center border-destructive">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Payment Not Completed</CardTitle>
          <CardDescription>
            Your payment was not completed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your order has been created and is waiting for payment. You can view your order status in the Orders page.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate({ to: '/orders' })}>View My Orders</Button>
            <Button variant="outline" onClick={() => navigate({ to: '/menu' })}>
              Browse Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
