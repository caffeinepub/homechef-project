import React, { useState } from 'react';
import { useGetAllMenuItems } from '../../hooks/useQueries';
import {
  useAddMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
} from '../../hooks/mutations/useMenuAdminMutations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { MenuItem } from '../../backend';

export default function MenuAdminPage() {
  const { data: menuItems = [], isLoading } = useGetAllMenuItems();
  const addMenuItem = useAddMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    preparationTimeMinutes: '',
    isAvailable: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      imageUrl: '',
      preparationTimeMinutes: '',
      isAvailable: true,
    });
    setEditingItem(null);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: (Number(item.price) / 100).toString(),
      category: item.category,
      imageUrl: item.imageUrl,
      preparationTimeMinutes: item.preparationTimeMinutes.toString(),
      isAvailable: item.isAvailable,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.category.trim()) {
      toast.error('Name and category are required');
      return;
    }

    const priceInCents = Math.round(parseFloat(formData.price || '0') * 100);
    const prepTime = parseInt(formData.preparationTimeMinutes || '0');

    try {
      if (editingItem) {
        await updateMenuItem.mutateAsync({
          itemId: editingItem.id,
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: BigInt(priceInCents),
          category: formData.category.trim(),
          imageUrl: formData.imageUrl.trim(),
          isAvailable: formData.isAvailable,
          preparationTimeMinutes: BigInt(prepTime),
        });
      } else {
        await addMenuItem.mutateAsync({
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: BigInt(priceInCents),
          category: formData.category.trim(),
          imageUrl: formData.imageUrl.trim(),
          isAvailable: formData.isAvailable,
          preparationTimeMinutes: BigInt(prepTime),
        });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (itemId: bigint) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    await deleteMenuItem.mutateAsync(itemId);
  };

  if (isLoading) {
    return (
      <div className="container py-16">
        <p className="text-center text-muted-foreground">Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Menu Management</h1>
          <p className="text-muted-foreground">Add, edit, and manage menu items</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
              <DialogDescription>
                {editingItem ? 'Update the menu item details' : 'Create a new menu item'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    min="0"
                    value={formData.preparationTimeMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, preparationTimeMinutes: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                />
                <Label htmlFor="isAvailable">Available for ordering</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={addMenuItem.isPending || updateMenuItem.isPending}>
                  {editingItem ? 'Update Item' : 'Add Item'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu Items ({menuItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {menuItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No menu items yet. Add your first item to get started!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Prep Time</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems.map((item) => (
                  <TableRow key={item.id.toString()}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>${(Number(item.price) / 100).toFixed(2)}</TableCell>
                    <TableCell>{item.preparationTimeMinutes.toString()} min</TableCell>
                    <TableCell>{item.isAvailable ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
