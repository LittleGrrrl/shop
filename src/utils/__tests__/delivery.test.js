import { describe, test, expect } from "vitest";
import { getDeliveryPrice } from "../cart-utils";

describe("getDeliveryPrice", () => {
  test("бесплатная доставка при заказе от 2000 ₽", () => {
    expect(getDeliveryPrice(2000)).toBe(0);
    expect(getDeliveryPrice(5000)).toBe(0);
  });

  test("фиксированная стоимость при заказе ниже порога", () => {
    expect(getDeliveryPrice(1999)).toBe(350);
    expect(getDeliveryPrice(100)).toBe(350);
  });

  test("бесплатная доставка на пограничном значении", () => {
    expect(getDeliveryPrice(2000)).toBe(0);
  });

  test("ошибка при отрицательной сумме", () => {
    expect(() => getDeliveryPrice(-100)).toThrow();
  });

  test("ошибка при нечисловом аргументе", () => {
    expect(() => getDeliveryPrice(null)).toThrow();
    expect(() => getDeliveryPrice("abc")).toThrow();
  });
});
