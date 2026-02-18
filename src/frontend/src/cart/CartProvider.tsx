import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { MenuItem } from '../backend';
import { serializeCart, deserializeCart } from './cartStorage';

export type CartItem = {
  menuItem: MenuItem;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (menuItem: MenuItem) => void;
  removeItem: (itemId: bigint) => void;
  updateQuantity: (itemId: bigint, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  itemCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      return deserializeCart(stored);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cart', serializeCart(items));
  }, [items]);

  const addItem = (menuItem: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((item) =>
          item.menuItem.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  const removeItem = (itemId: bigint) => {
    setItems((prev) => prev.filter((item) => item.menuItem.id !== itemId));
  };

  const updateQuantity = (itemId: bigint, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.menuItem.id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalAmount = items.reduce((sum, item) => sum + Number(item.menuItem.price) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalAmount,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
