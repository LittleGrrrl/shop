import { ApiError } from "./ApiError.js";

export function adaptProductList(data) {
  const invalid = () => { throw new ApiError("INVALID_RESPONSE", "Некорректный ответ каталога"); };
  if (!data || !Array.isArray(data.items) || !Number.isInteger(data.total) || data.total < 0 ||
      !Number.isInteger(data.page) || data.page < 1 || data.total < data.items.length) invalid();
  const ids = new Set();
  const items = data.items.map((item) => {
    if (!item || !Number.isFinite(item.item_id) || ids.has(item.item_id) ||
        !Number.isFinite(item.item_price) || typeof item.in_stock !== "boolean" ||
        !Number.isFinite(item.discount) ||
        ![item.item_name, item.category, item.image, item.description].every((value) => typeof value === "string")) invalid();
    ids.add(item.item_id);
    return {
      id: item.item_id, name: item.item_name, price: item.item_price,
      inStock: item.in_stock, category: item.category, discount: item.discount,
      image: item.image, description: item.description,
    };
  });
  return { items, total: data.total, page: data.page };
}
