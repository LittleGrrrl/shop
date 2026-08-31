import { validatePromo } from "./promo.js";

describe("validatePromo", () => {
  it("returns a discount for a valid promo code", () => {
    expect(validatePromo("SALE15")).toEqual({ valid: true, discount: 15 });
  });

  it("rejects an invalid promo code", () => {
    expect(validatePromo("FAKECODE")).toEqual({ valid: false });
  });

  it("rejects an empty promo code", () => {
    expect(validatePromo("")).toEqual({ valid: false });
  });

  it("accepts a promo code in mixed case", () => {
    expect(validatePromo("WeLcOmE10")).toEqual({
      valid: true,
      discount: 10,
    });
  });
});
