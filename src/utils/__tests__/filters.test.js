import { filterProducts } from "../filters.js";

const PRODUCTS = [
  { id: 1, price: 999, discount: 0, category: "Обувь" },
  { id: 2, price: 1000, discount: 0, category: "Обувь" },
  { id: 3, price: 2000, discount: 0, category: "Одежда" },
  { id: 4, price: 3000, discount: 0, category: "Обувь" },
  { id: 5, price: 3001, discount: 0, category: "Обувь" },
  { id: 6, price: 4000, discount: 50, category: "Аксессуары" },
  { id: 7, price: 1500, discount: 50, category: "Обувь" },
];

describe("filterProducts", () => {
  it("includes both price boundaries and uses prices after discounts", () => {
    expect(filterProducts(PRODUCTS, { minPrice: 1000, maxPrice: 3000 })).toEqual([
      PRODUCTS[1], PRODUCTS[2], PRODUCTS[3], PRODUCTS[5],
    ]);
  });

  it.each([
    [1000, 500],
    ["1000", "500"],
  ])("treats minPrice %s greater than maxPrice %s as swapped price bounds", (minPrice, maxPrice) => {
    const expected = filterProducts(PRODUCTS, {
      minPrice: 500,
      maxPrice: 1000,
    });
    const filters = Object.freeze({ minPrice, maxPrice });
    const result = filterProducts(PRODUCTS, filters);

    expect(result).toEqual(expected);
    expect(result).toEqual([PRODUCTS[0], PRODUCTS[1], PRODUCTS[6]]);
    expect(filters).toEqual({ minPrice, maxPrice });
  });

  it("normalizes 500–100 to 100–500 including both boundaries", () => {
    const products = [99, 100, 300, 500, 501].map((price) => ({ price, discount: 0 }));

    expect(filterProducts(products, { minPrice: 500, maxPrice: 100 })).toEqual([
      products[1], products[2], products[3],
    ]);
  });

  it("returns only products in the selected category", () => {
    expect(filterProducts(PRODUCTS, { categories: ["Обувь"] })).toEqual([
      PRODUCTS[0], PRODUCTS[1], PRODUCTS[3], PRODUCTS[4], PRODUCTS[6],
    ]);
  });

  it("applies price and category filters together", () => {
    expect(filterProducts(PRODUCTS, {
      minPrice: 1000,
      maxPrice: 3000,
      categories: ["Обувь"],
    })).toEqual([PRODUCTS[1], PRODUCTS[3]]);
  });

  it("returns an empty array when no products match", () => {
    expect(filterProducts(PRODUCTS, {
      minPrice: 2500,
      maxPrice: 3000,
      categories: ["Одежда"],
    })).toEqual([]);
  });

  it("returns an empty array for empty products", () => {
    expect(filterProducts([], {
      minPrice: 1000,
      maxPrice: 3000,
      categories: ["Обувь"],
    })).toEqual([]);
  });

  it("keeps products below the maximum when minPrice is undefined", () => {
    expect(filterProducts(PRODUCTS, {
      minPrice: undefined,
      maxPrice: 1000,
    })).toEqual([PRODUCTS[0], PRODUCTS[1], PRODUCTS[6]]);
  });

  it.each([undefined, null, ""])("keeps products above the minimum when maxPrice is %s", (maxPrice) => {
    expect(filterProducts(PRODUCTS, {
      minPrice: 3000,
      maxPrice,
    })).toEqual([PRODUCTS[3], PRODUCTS[4]]);
  });

  it("does not restrict categories when categories is undefined", () => {
    expect(filterProducts(PRODUCTS, {
      minPrice: 1000,
      maxPrice: 3000,
      categories: undefined,
    })).toEqual([PRODUCTS[1], PRODUCTS[2], PRODUCTS[3], PRODUCTS[5]]);
  });

  it.each([
    {},
    { minPrice: undefined, maxPrice: undefined, categories: undefined },
    { minPrice: "", maxPrice: "", categories: [] },
  ])("returns all products for inactive filters %j", (filters) => {
    expect(filterProducts(PRODUCTS, filters)).toEqual(PRODUCTS);
  });

  it("returns all products when filters are omitted", () => {
    expect(filterProducts(PRODUCTS)).toEqual(PRODUCTS);
  });

  it("accepts price bounds from input fields as strings", () => {
    expect(filterProducts(PRODUCTS, { minPrice: "1000", maxPrice: "3000" })).toEqual([
      PRODUCTS[1], PRODUCTS[2], PRODUCTS[3], PRODUCTS[5],
    ]);
  });

  it("matches any selected category within the price range", () => {
    expect(filterProducts(PRODUCTS, {
      minPrice: 1000,
      maxPrice: 3000,
      categories: ["Обувь", "Аксессуары"],
    })).toEqual([PRODUCTS[1], PRODUCTS[3], PRODUCTS[5]]);
  });

  it("returns a new array without mutating products or filters", () => {
    const products = Object.freeze(PRODUCTS.map((product) => Object.freeze({ ...product })));
    const filters = Object.freeze({
      minPrice: 1000,
      maxPrice: 3000,
      categories: Object.freeze(["Обувь"]),
    });

    const result = filterProducts(products, filters);

    expect(result).toEqual([PRODUCTS[1], PRODUCTS[3]]);
    expect(result).not.toBe(products);
    expect(products).toEqual(PRODUCTS);
    expect(filterProducts(products)).not.toBe(products);
  });
});
