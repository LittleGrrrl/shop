import { act, renderHook } from "@testing-library/react";
import { adaptProductList } from "../../api/adaptProductList.js";
import mockData from "../../api/mocks/catalog.json";

const { fetchProductsWithRetry } = vi.hoisted(() => ({ fetchProductsWithRetry: vi.fn() }));
vi.mock("../../api/catalog.js", () => ({ fetchProductsWithRetry }));

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
});
afterEach(() => vi.unstubAllEnvs());

it("returns six adapted mock products without calling the API, including on retry", async () => {
  vi.stubEnv("VITE_USE_MOCK_DATA", "true");
  const { useProducts } = await import("../useProducts.js");
  const { result } = renderHook(() => useProducts());

  expect(result.current.status).toBe("success");
  expect(result.current.error).toBeNull();
  expect(result.current.products).toHaveLength(6);
  expect(result.current.products).toEqual(adaptProductList(mockData).items);
  expect(result.current.products[0]).toMatchObject({
    id: mockData.items[0].item_id,
    name: mockData.items[0].item_name,
    price: mockData.items[0].item_price,
    inStock: mockData.items[0].in_stock,
  });

  vi.stubEnv("VITE_USE_MOCK_DATA", "false");
  act(() => result.current.retry());
  expect(result.current.status).toBe("success");
  expect(result.current.products).toEqual(adaptProductList(mockData).items);
  expect(fetchProductsWithRetry).not.toHaveBeenCalled();
});
