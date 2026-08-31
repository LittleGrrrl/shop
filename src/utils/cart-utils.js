import { calcDiscountPrice } from "./price.js";

export function getSubtotal(items) {
  return items.reduce((sum, item) => {
    const unitPrice = calcDiscountPrice(item.price, item.discount);
    return sum + unitPrice * item.quantity;
  }, 0);
}

export function applyDiscount(subtotal, discountPercent) {
  if (!discountPercent || discountPercent <= 0) return subtotal;
  return Math.round(subtotal * (1 - discountPercent / 100));
}
