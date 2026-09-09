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

function validatePositiveNumber(value) {
  if (!Number.isFinite(value)) {
    throw new TypeError("Сумма заказа должна быть конечным числом");
  }
  if (value < 0) {
    throw new RangeError("Сумма заказа не может быть отрицательной");
  }
}

export function getDeliveryPrice(subtotal) {
  const FREE_DELIVERY_THRESHOLD = 2000;
  const DELIVERY_PRICE = 350;

  validatePositiveNumber(subtotal);

  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_PRICE;
}
