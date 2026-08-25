import { createContext, useContext, useMemo, useState } from 'react';
import { getProductById } from '../data/products';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addToCart = (productId) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === productId);
      if (existing) {
        return current.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { id: productId, quantity: 1 }];
    });
  };

  const value = useMemo(() => {
    const detailedItems = items
      .map((item) => {
        const product = getProductById(item.id);
        if (!product) return null;
        return { ...product, quantity: item.quantity };
      })
      .filter(Boolean);

    const total = detailedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const count = detailedItems.reduce((sum, item) => sum + item.quantity, 0);

    return { items: detailedItems, total, count, addToCart };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
