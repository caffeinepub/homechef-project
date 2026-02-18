import React from 'react';
import { useGetOrdersByUser } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import { Package } from 'lucide-react';

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useGetOrdersByUser();

  if (isLoading) {
    return (
      <div className="container py-16">
        <p className="text-center text-muted-foreground">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle>No orders yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Your order history will appear here</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedOrders = [...orders].sort((a, b) => Number(b.createdAt - a.createdAt));

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Your Orders</h1>

      <div className="space-y-4">
        {sortedOrders.map((order) => (
          <Card key={order.id.toString()}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">Order #{order.id.toString()}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(Number(order.createdAt) / 1000000).toLocaleString()}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Items:</p>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-sm text-muted-foreground">
                        Item #{item.itemId.toString()} × {item.quantity.toString()}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-lg font-bold">${(Number(order.totalAmount) / 100).toFixed(2)}</span>
                </div>

                {order.deliveryAddress && (
                  <div className="text-sm">
                    <span className="font-medium">Delivery to:</span> {order.deliveryAddress}
                  </div>
                )}

                {order.paymentReference && (
                  <div className="text-xs text-muted-foreground">
                    Payment: {
                      order.paymentReference.startsWith('STRIPE_') 
                        ? 'Card (Stripe)' 
                        : order.paymentReference === 'QR_CODE_PAYMENT'
                        ? 'QR Code'
                        : order.paymentReference === 'CASH_ON_DELIVERY'
                        ? 'Cash on Delivery'
                        : order.paymentReference
                    }
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
