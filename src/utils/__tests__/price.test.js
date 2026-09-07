import { calcDiscountPrice, formatPrice } from "../price.js";

describe("calcDiscountPrice", () => {
  it("applies a 20% discount to 5000 rubles", () => {
    expect(calcDiscountPrice(5000, 20)).toBe(4000);
  });

  it("returns the original price when discount is 0", () => {
    expect(calcDiscountPrice(5000, 0)).toBe(5000);
  });

  it("returns 0 when discount is 100%", () => {
    expect(calcDiscountPrice(5000, 100)).toBe(0);
  });

  it("returns 0 when price is 0", () => {
    expect(calcDiscountPrice(0, 20)).toBe(0);
  });

  it("returns the original price when discount is negative", () => {
    expect(calcDiscountPrice(5000, -10)).toBe(5000);
  });

  it("returns the original price without throwing when discount is null", () => {
    expect(calcDiscountPrice(5000, null)).toBe(5000);
  });

  it("returns the original price without throwing when discount is undefined", () => {
    expect(calcDiscountPrice(5000, undefined)).toBe(5000);
  });

  it("clamps result to 0 when discount exceeds 100%", () => {
    expect(calcDiscountPrice(5000, 150)).toBe(0);
  });

  it.each([
    [5000, 3334],
    [2000, 1333],
  ])(
    "rounds a 33.33%% discount on %i rubles to %i rubles",
    (price, expected) => {
      expect(calcDiscountPrice(price, 33.33)).toBe(expected);
    },
  );
});

describe("formatPrice", () => {
  it("formats integer rubles", () => {
    expect(formatPrice(2490)).toBe("2\u00a0490 ₽");
  });
});
