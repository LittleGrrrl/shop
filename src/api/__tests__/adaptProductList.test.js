import { adaptProductList } from "../adaptProductList.js";
import { ApiError } from "../ApiError.js";
import data from "../mocks/catalog.json";

it("adapts supplier fields", () => {
  expect(adaptProductList(data).items[0]).toMatchObject({ id: 1, name: "Футболка с принтом", price: 2490, inStock: true });
});

it.each([null, {}, { ...data, total: "6" }, { ...data, items: [null] },
  { ...data, items: [{ ...data.items[0], item_price: "2490" }] },
  { ...data, items: [data.items[0], data.items[0]] },
])("rejects invalid responses", (value) => {
  expect(() => adaptProductList(value)).toThrow(ApiError);
  expect(() => adaptProductList(value)).toThrow(expect.objectContaining({ code: "INVALID_RESPONSE" }));
});
