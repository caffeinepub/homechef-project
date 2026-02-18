import React from 'react';
import type { MenuItem } from '../../backend';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus } from 'lucide-react';

type MenuItemCardProps = {
  item: MenuItem;
  onAddToCart?: (item: MenuItem) => void;
  showAvailability?: boolean;
};

export default function MenuItemCard({ item, onAddToCart, showAvailability = true }: MenuItemCardProps) {
  const priceInDollars = (Number(item.price) / 100).toFixed(2);

  return (
    <Card className={!item.isAvailable ? 'opacity-60' : ''}>
      <CardHeader className="p-0">
        <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          {showAvailability && (
            <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
              {item.isAvailable ? 'Available' : 'Unavailable'}
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2 mb-3">{item.description}</CardDescription>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{item.preparationTimeMinutes} min</span>
          </div>
          <Badge variant="outline">{item.category}</Badge>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <span className="text-2xl font-bold">${priceInDollars}</span>
        {onAddToCart && (
          <Button onClick={() => onAddToCart(item)} disabled={!item.isAvailable} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
