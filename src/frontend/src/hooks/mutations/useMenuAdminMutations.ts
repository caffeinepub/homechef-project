import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { toast } from 'sonner';

export function useAddMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      price: bigint;
      category: string;
      imageUrl: string;
      isAvailable: boolean;
      preparationTimeMinutes: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMenuItem(
        data.name,
        data.description,
        data.price,
        data.category,
        data.imageUrl,
        data.isAvailable,
        data.preparationTimeMinutes
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allMenuItems'] });
      queryClient.invalidateQueries({ queryKey: ['availableMenuItems'] });
      queryClient.invalidateQueries({ queryKey: ['menuCategories'] });
      toast.success('Menu item added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add menu item: ${error.message}`);
    },
  });
}

export function useUpdateMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      itemId: bigint;
      name: string;
      description: string;
      price: bigint;
      category: string;
      imageUrl: string;
      isAvailable: boolean;
      preparationTimeMinutes: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMenuItem(
        data.itemId,
        data.name,
        data.description,
        data.price,
        data.category,
        data.imageUrl,
        data.isAvailable,
        data.preparationTimeMinutes
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allMenuItems'] });
      queryClient.invalidateQueries({ queryKey: ['availableMenuItems'] });
      queryClient.invalidateQueries({ queryKey: ['menuCategories'] });
      toast.success('Menu item updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update menu item: ${error.message}`);
    },
  });
}

export function useDeleteMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMenuItem(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allMenuItems'] });
      queryClient.invalidateQueries({ queryKey: ['availableMenuItems'] });
      toast.success('Menu item deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete menu item: ${error.message}`);
    },
  });
}
