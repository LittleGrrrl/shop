import { calcDiscountPrice, formatPrice } from "./price.js";

describe("calcDiscountPrice", () => {
  it("returns original price when discount is 0", () => {
    expect(calcDiscountPrice(1000, 0)).toBe(1000);
  });

  it("applies percent discount", () => {
    expect(calcDiscountPrice(2490, 20)).toBe(1992);
  });
});

describe("formatPrice", () => {
  it("formats integer rubles", () => {
    expect(formatPrice(2490)).toBe("2\u00a0490 ₽");
  });
});
