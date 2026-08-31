import { applyDiscount, getSubtotal } from "./cart-utils.js";

describe("getSubtotal", () => {
  it("calculates the subtotal including product discounts and quantities", () => {
    const items = [
      { price: 2500, discount: 20, quantity: 2 },
      { price: 2000, discount: 0, quantity: 1 },
    ];

    expect(getSubtotal(items)).toBe(6000);
  });
});

describe("applyDiscount", () => {
  it("applies a 15% discount to 10,000 rubles", () => {
    expect(applyDiscount(10000, 15)).toBe(8500);
  });

  it("applies a 15% discount to 6,000 rubles", () => {
    expect(applyDiscount(6000, 15)).toBe(5100);
  });

  it("returns the subtotal when the discount is removed", () => {
    expect(applyDiscount(6000, 0)).toBe(6000);
  });
});
