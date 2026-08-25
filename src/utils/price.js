// Цена после скидки. discount — процент (0..100). 0 или falsy → возвращает исходную цену.
export function calcDiscountPrice(price, discount) {
  if (!discount || discount <= 0) return price;
  return Math.round(price * (1 - discount / 100));
}

// Форматирование цены для отображения. Целое число рублей, без десятичных.
export function formatPrice(price) {
  return `${price.toLocaleString("ru-RU")} ₽`;
}
