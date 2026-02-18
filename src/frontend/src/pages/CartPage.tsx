import React, { useState } from 'react';
import { useCart } from '../cart/CartProvider';
import { useCreateCheckoutSession } from '../hooks/payments/useCreateCheckoutSession';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import type { ShoppingItem, OrderItem } from '../backend';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalAmount } = useCart();
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { storeIntendedRoute } = useAuthRedirect();
  const createCheckoutSession = useCreateCheckoutSession();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const isAuthenticated = !!identity;

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!deliveryAddress.trim() || !contactNumber.trim()) {
      toast.error('Please provide delivery address and contact number');
      return;
    }

    // Gate checkout behind authentication
    if (!isAuthenticated) {
      storeIntendedRoute('/cart');
      toast.error('Please sign in to complete your order');
      return;
    }

    if (!actor) {
      toast.error('Please wait for connection to be established');
      return;
    }

    try {
      // Create order in backend first
      const orderItems: OrderItem[] = items.map((item) => ({
        itemId: item.menuItem.id,
        quantity: BigInt(item.quantity),
        specialInstructions: '',
      }));

      const orderId = await actor.createOrder(
        orderItems,
        deliveryAddress.trim(),
        contactNumber.trim(),
        specialInstructions.trim()
      );

      // Create checkout session
      const shoppingItems: ShoppingItem[] = items.map((item) => ({
        productName: item.menuItem.name,
        productDescription: item.menuItem.description,
        priceInCents: item.menuItem.price,
        quantity: BigInt(item.quantity),
        currency: 'usd',
      }));

      const session = await createCheckoutSession.mutateAsync(shoppingItems);

      if (!session?.url) {
        throw new Error('Payment session missing url');
      }

      // Store order ID for payment success page
      sessionStorage.setItem('pendingOrderId', orderId.toString());

      // Clear cart and redirect to payment
      clearCart();
      window.location.href = session.url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to initiate checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Your cart is empty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Add some delicious items from our menu!</p>
            <Button onClick={() => (window.location.href = '/menu')}>Browse Menu</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.menuItem.id.toString()}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {item.menuItem.imageUrl ? (
                      <img
                        src={item.menuItem.imageUrl}
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{item.menuItem.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{item.menuItem.category}</p>
                    <p className="font-semibold">${(Number(item.menuItem.price) / 100).toFixed(2)}</p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.menuItem.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address *</Label>
                <Textarea
                  id="address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your delivery address"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number *</Label>
                <Input
                  id="contact"
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Your phone number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                <Textarea
                  id="instructions"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requests?"
                  rows={2}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${(totalAmount / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${(totalAmount / 100).toFixed(2)}</span>
                </div>
              </div>

              {!isAuthenticated && (
                <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
                  You'll need to sign in to complete your order
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={createCheckoutSession.isPending || !deliveryAddress.trim() || !contactNumber.trim()}
              >
                {createCheckoutSession.isPending ? 'Processing...' : isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Checkout'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
