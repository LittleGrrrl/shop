import { ApiError, ErrorType } from "./errors.js";

export function adaptProduct(raw) {
  return {
    id: raw.item_id,
    name: raw.item_name,
    price: raw.item_price,
    inStock: raw.in_stock,
    category: raw.category,
    discount: raw.discount,
    image: raw.image,
    description: raw.description,
  };
}

export function adaptProductList(response) {
  if (!Array.isArray(response?.items)) {
    throw new ApiError(
      "Некорректный ответ API: items должен быть массивом.",
      ErrorType.INVALID_RESPONSE,
    );
  }

  return {
    products: response.items.map(adaptProduct),
    total: response.total,
    page: response.page,
  };
}
