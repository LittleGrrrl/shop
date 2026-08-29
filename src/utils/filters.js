import { calcDiscountPrice } from "./price.js";

export function filterProducts(products, { minPrice, maxPrice, categories } = {}) {
  const hasMinPrice = minPrice !== undefined && minPrice !== null && minPrice !== "";
  const hasMaxPrice = maxPrice !== undefined && maxPrice !== null && maxPrice !== "";
  const normalizedMinPrice = Number(minPrice);
  const normalizedMaxPrice = Number(maxPrice);
  const selectedCategories = new Set(categories ?? []);

  return products.filter((product) => {
    const finalPrice = calcDiscountPrice(product.price, product.discount);
    const matchesMinPrice =
      !hasMinPrice || Number.isNaN(normalizedMinPrice) || finalPrice >= normalizedMinPrice;
    const matchesMaxPrice =
      !hasMaxPrice || Number.isNaN(normalizedMaxPrice) || finalPrice <= normalizedMaxPrice;
    const matchesCategory =
      selectedCategories.size === 0 || selectedCategories.has(product.category);

    return matchesMinPrice && matchesMaxPrice && matchesCategory;
  });
}
