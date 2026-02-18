import React, { useMemo } from 'react';
import { useGetAllAvailableMenuItems, useGetMenuCategories } from '../hooks/useQueries';
import { useCart } from '../cart/CartProvider';
import MenuItemCard from '../components/menu/MenuItemCard';
import MenuSkeletonGrid from '../components/menu/MenuSkeletonGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { MenuItem } from '../backend';

export default function MenuPage() {
  const { data: menuItems = [], isLoading: itemsLoading, error: itemsError, refetch: refetchItems } = useGetAllAvailableMenuItems();
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useGetMenuCategories();
  const { addItem } = useCart();

  const handleAddToCart = (item: MenuItem) => {
    addItem(item);
    toast.success(`${item.name} added to cart`);
  };

  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {};
    menuItems.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  }, [menuItems]);

  const isLoading = itemsLoading || categoriesLoading;
  const hasError = itemsError || categoriesError;

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Our Menu</h1>
          <p className="text-muted-foreground">Fresh homemade dishes prepared with love</p>
        </div>
        <MenuSkeletonGrid />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center space-y-4">
          <AlertCircle className="h-16 w-16 mx-auto text-destructive" />
          <h2 className="text-2xl font-bold">Failed to load menu</h2>
          <p className="text-muted-foreground">
            We couldn't load the menu items. Please check your connection and try again.
          </p>
          <Button
            onClick={() => {
              refetchItems();
              refetchCategories();
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="container py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Our Menu</h1>
          <p className="text-muted-foreground">No items available at the moment. Check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Our Menu</h1>
        <p className="text-muted-foreground">Fresh homemade dishes prepared with love</p>
      </div>

      {categories.length > 0 ? (
        <Tabs defaultValue={categories[0]} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="all">All Items</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {menuItems.map((item) => (
                <MenuItemCard key={item.id.toString()} item={item} onAddToCart={handleAddToCart} />
              ))}
            </div>
          </TabsContent>

          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(itemsByCategory[category] || []).map((item) => (
                  <MenuItemCard key={item.id.toString()} item={item} onAddToCart={handleAddToCart} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <MenuItemCard key={item.id.toString()} item={item} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
}
