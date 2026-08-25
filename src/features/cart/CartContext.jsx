import { createContext, useContext, useState } from "react";
import { calcDiscountPrice } from "../../utils/price.js";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  function addToCart(product, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, { ...product, quantity }];
    });
  }

  function removeFromCart(productId) {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }

  function getTotal() {
    return items.reduce((sum, item) => {
      const unitPrice = calcDiscountPrice(item.price, item.discount);
      return sum + unitPrice * item.quantity;
    }, 0);
  }

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, getTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
