import data from "../mocks/catalog.json";

let getProducts;
let fetchProducts;
let fetchProductsWithRetry;
let ApiError;
const response = (status = 200, body = data, retryAfter = null) => ({
  ok: status === 200, status, headers: { get: () => retryAfter }, json: async () => body,
});

beforeEach(async () => {
  vi.resetModules();
  vi.useFakeTimers();
  vi.stubEnv("VITE_USE_MOCK_DATA", "false");
  vi.stubEnv("VITE_API_KEY", "test-key");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response()));
  localStorage.clear();
  ({ getProducts, fetchProducts, fetchProductsWithRetry } = await import("../catalog.js"));
  ({ ApiError } = await import("../ApiError.js"));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

it("sends params and API key and adapts the response", async () => {
  const result = await getProducts({ category: "Одежда" });
  const [url, options] = fetch.mock.calls[0];
  expect(new URL(url, "http://localhost").searchParams.get("category")).toBe("Одежда");
  expect(options.headers["X-Api-Key"]).toBe("test-key");
  expect(result.items.map(({ id, name, price, inStock }) => ({ id, name, price, inStock })))
    .toEqual(data.items.map(({ item_id, item_name, item_price, in_stock }) => ({
      id: item_id, name: item_name, price: item_price, inStock: in_stock,
    })));
  expect(result.items[0]).not.toHaveProperty("item_id");
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(result.fallback).toBe(false);
});

it("aborts timed out requests and exposes ApiError", async () => {
  fetch.mockImplementation(() => new Promise(() => {}));
  const result = getProducts().catch((error) => error);
  await vi.runAllTimersAsync();
  expect(await result).toBeInstanceOf(ApiError);
  expect(await result).toMatchObject({ type: "TIMEOUT", code: "TIMEOUT" });
  expect(fetch).toHaveBeenCalledTimes(3);
  expect(fetch.mock.calls.every(([, options]) => options.signal.aborted)).toBe(true);
});

it("wraps a network failure in ApiError", async () => {
  fetch.mockRejectedValue(new TypeError("Failed to fetch"));
  const error = await fetchProducts().catch((error) => error);
  expect(error).toBeInstanceOf(ApiError);
  expect(error).toMatchObject({ type: "NETWORK", code: "NETWORK_ERROR" });
  expect(fetch).toHaveBeenCalledTimes(1);
});

it.each([500, 502, 503])("retries %s and ultimately fails", async (status) => {
  fetch.mockResolvedValue(response(status));
  const onRetry = vi.fn();
  const result = getProducts({}, { onRetry }).catch((error) => error);
  await vi.runAllTimersAsync();
  expect(await result).toBeInstanceOf(ApiError);
  expect(await result).toMatchObject({ type: "SERVER", code: "HTTP_ERROR", status });
  expect(fetch).toHaveBeenCalledTimes(3);
  expect(onRetry.mock.calls).toEqual([[1], [2]]);
});

it("uses cached data after network failure", async () => {
  const cached = await getProducts();
  fetch.mockClear().mockRejectedValue(new TypeError("offline"));
  const result = getProducts();
  await vi.runAllTimersAsync();
  expect(await result).toEqual({ ...cached, fallback: true, fromCache: true });
  expect(fetch).toHaveBeenCalledTimes(3);
});

it.each([400, 401])("does not retry or hide %s behind cache", async (status) => {
  await getProducts();
  fetch.mockClear().mockResolvedValue(response(status));
  const onRetry = vi.fn();
  const error = await getProducts({}, { onRetry }).catch((error) => error);
  expect(error).toBeInstanceOf(ApiError);
  expect(error).toMatchObject({ type: "CLIENT", code: "HTTP_ERROR", status });
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(onRetry).not.toHaveBeenCalled();
});

it("exposes RATE_LIMIT and Retry-After without retry when cache is absent", async () => {
  fetch.mockResolvedValue(response(429, null, "3"));
  const onRetry = vi.fn();
  const error = await fetchProductsWithRetry({}, { onRetry }).catch((error) => error);
  expect(error).toBeInstanceOf(ApiError);
  expect(error).toMatchObject({ type: "RATE_LIMIT", code: "HTTP_ERROR", status: 429, retryAfter: 3000 });
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(onRetry).not.toHaveBeenCalled();
});

it("falls back to cached data on 429 without retrying", async () => {
  const cached = await fetchProducts();
  fetch.mockClear().mockResolvedValue(response(429, null, "3"));
  const onRetry = vi.fn();
  await expect(getProducts({}, { onRetry })).resolves.toEqual({
    ...cached, fromCache: true, fallback: true,
  });
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(onRetry).not.toHaveBeenCalled();
});

it("enforces 100 requests per rolling minute", async () => {
  for (let i = 0; i < 100; i += 1) await getProducts();
  const result = getProducts();
  await vi.advanceTimersByTimeAsync(59999);
  expect(fetch).toHaveBeenCalledTimes(100);
  await vi.advanceTimersByTimeAsync(1);
  await result;
  expect(fetch).toHaveBeenCalledTimes(101);
});

it.each([{}, { ...data, page: 2 }])("rejects invalid response without fallback", async (body) => {
  await getProducts();
  fetch.mockClear().mockResolvedValue(response(200, body));
  const onRetry = vi.fn();
  const error = await getProducts({}, { onRetry }).catch((error) => error);
  expect(error).toBeInstanceOf(ApiError);
  expect(error).toMatchObject({ type: "INVALID_RESPONSE", code: "INVALID_RESPONSE" });
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(onRetry).not.toHaveBeenCalled();
});

it("rejects invalid JSON", async () => {
  fetch.mockResolvedValue({ ...response(), json: async () => { throw new SyntaxError(); } });
  await expect(getProducts()).rejects.toMatchObject({ type: "INVALID_RESPONSE", code: "INVALID_RESPONSE" });
});

it("ignores damaged cache", async () => {
  await getProducts({ category: "Обувь" });
  localStorage.setItem("products_cache", "invalid");
  fetch.mockRejectedValue(new Error());
  const result = getProducts().catch((error) => error);
  await vi.runAllTimersAsync();
  expect(await result).toMatchObject({ code: "NETWORK_ERROR" });
});

it("validates parameters", async () => {
  await expect(getProducts({ limit: 51 })).rejects.toMatchObject({ code: "INVALID_PARAMS" });
  expect(fetch).not.toHaveBeenCalled();
});

it("uses supplier mocks with filtering and pagination", async () => {
  vi.stubEnv("VITE_USE_MOCK_DATA", "true");
  const result = await getProducts({ category: "Аксессуары", page: 2, limit: 2 });
  expect(result.total).toBe(3);
  expect(result.items.map((item) => item.id)).toEqual([6]);
  expect(fetch).not.toHaveBeenCalled();
});

it("caches adapted data in fetchProducts without retrying", async () => {
  const result = await fetchProducts();
  expect(JSON.parse(localStorage.getItem("products_cache"))).toEqual(result);
  expect(result.items[0]).toHaveProperty("id", 1);
  fetch.mockClear().mockRejectedValue(new TypeError("offline"));
  await expect(fetchProducts()).rejects.toMatchObject({ code: "NETWORK_ERROR" });
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("notifies before waiting 1 and 2 seconds and returns a successful retry", async () => {
  fetch.mockResolvedValueOnce(response(503)).mockResolvedValueOnce(response(500));
  const onRetry = vi.fn();
  const result = fetchProductsWithRetry({ category: "Одежда" }, { onRetry });
  await vi.advanceTimersByTimeAsync(0);
  expect(onRetry.mock.calls).toEqual([[1]]);
  await vi.advanceTimersByTimeAsync(999);
  expect(fetch).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(1);
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(onRetry.mock.calls).toEqual([[1], [2]]);
  await vi.advanceTimersByTimeAsync(1999);
  expect(fetch).toHaveBeenCalledTimes(2);
  await vi.advanceTimersByTimeAsync(1);
  expect(await result).not.toHaveProperty("fromCache");
  expect(fetch).toHaveBeenCalledTimes(3);
  expect(fetch.mock.calls.every(([url]) => new URL(url, "http://localhost").searchParams.get("category") === "Одежда")).toBe(true);
});

it("returns adapted cache only after all three attempts fail", async () => {
  const cached = await fetchProducts();
  fetch.mockClear().mockResolvedValue(response(503));
  const onRetry = vi.fn();
  const result = fetchProductsWithRetry({}, { onRetry });
  await vi.runAllTimersAsync();
  expect(await result).toEqual({ ...cached, fromCache: true });
  expect(fetch).toHaveBeenCalledTimes(3);
  expect(onRetry.mock.calls).toEqual([[1], [2]]);
});

it("throws the last error when cache is absent", async () => {
  expect(localStorage.getItem("products_cache")).toBeNull();
  fetch.mockResolvedValueOnce(response(500)).mockResolvedValueOnce(response(502)).mockResolvedValueOnce(response(503));
  const onRetry = vi.fn();
  const result = fetchProductsWithRetry({}, { onRetry }).catch((error) => error);
  await vi.runAllTimersAsync();
  expect(await result).toBeInstanceOf(ApiError);
  expect(await result).toMatchObject({ type: "SERVER", code: "HTTP_ERROR", status: 503 });
  expect(fetch).toHaveBeenCalledTimes(3);
  expect(onRetry.mock.calls).toEqual([[1], [2]]);
  expect(localStorage.getItem("products_cache")).toBeNull();
});
