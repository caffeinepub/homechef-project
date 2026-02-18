import React, { useState } from 'react';
import { useActor } from '../../hooks/useActor';
import { useIsStripeConfigured } from '../../hooks/useQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { StripeConfiguration } from '../../backend';

export default function PaymentSetup() {
  const { actor } = useActor();
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const queryClient = useQueryClient();

  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB');

  const setConfig = useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isStripeConfigured'] });
      toast.success('Payment provider configured successfully');
      setSecretKey('');
    },
    onError: (error: Error) => {
      toast.error(`Failed to configure payment: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey.trim()) {
      toast.error('Please enter a payment provider secret key');
      return;
    }

    const allowedCountries = countries
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length === 2);

    if (allowedCountries.length === 0) {
      toast.error('Please enter at least one valid country code');
      return;
    }

    setConfig.mutate({
      secretKey: secretKey.trim(),
      allowedCountries,
    });
  };

  if (isLoading) return null;
  if (isConfigured) return null;

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Configure Payment Provider</DialogTitle>
          <DialogDescription>
            Set up your payment provider to enable secure payment processing for orders and bookings.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> This platform uses Razorpay for payment processing. 
            Enter your Razorpay credentials below to get started.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secretKey">Razorpay Secret Key *</Label>
            <Input
              id="secretKey"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="rzp_test_..."
              required
            />
            <p className="text-xs text-muted-foreground">
              Get your Razorpay secret key from the Razorpay Dashboard
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="countries">Allowed Countries (comma-separated)</Label>
            <Input
              id="countries"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
              placeholder="US,CA,GB"
            />
            <p className="text-xs text-muted-foreground">Use 2-letter country codes (e.g., US, CA, GB)</p>
          </div>
          <Button type="submit" className="w-full" disabled={setConfig.isPending}>
            {setConfig.isPending ? 'Configuring...' : 'Configure Razorpay'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
