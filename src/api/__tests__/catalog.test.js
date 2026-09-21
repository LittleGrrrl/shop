import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchProducts, fetchProductsWithRetry } from "../catalog.js";
import { ApiError, ErrorType } from "../errors.js";

const CACHE_KEY = "products_cache";
const CACHED_CATALOG = {
  products: [{ id: 42, name: "Товар из кеша", price: 1500, inStock: true }],
  total: 1,
  page: 1,
};

describe("API-клиент каталога", () => {
  let fetchMock;
  let storage;

  beforeEach(() => {
    vi.useFakeTimers();
    const entries = new Map();
    storage = {
      getItem: vi.fn((key) => entries.get(key) ?? null),
      setItem: vi.fn((key, value) => entries.set(key, String(value))),
      removeItem: vi.fn((key) => entries.delete(key)),
      clear: vi.fn(() => entries.clear()),
    };
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("localStorage", storage);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("адаптирует id, name, price и inStock из валидного ответа 200", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        items: [{ item_id: 7, item_name: "Чайник", item_price: 2490, in_stock: false }],
        total: 1,
        page: 2,
      }),
    });

    const result = await fetchProducts({ page: 2 });

    expect(result).toEqual({
      products: [expect.objectContaining({ id: 7, name: "Чайник", price: 2490, inStock: false })],
      total: 1,
      page: 2,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/v2/products?page=2", expect.objectContaining({ method: "GET" }));
  });

  it("преобразует отклонение fetch с TimeoutError в ApiError типа TIMEOUT", async () => {
    const timeoutError = new Error("Время ожидания истекло");
    timeoutError.name = "TimeoutError";
    fetchMock.mockImplementation(() => new Promise((resolve, reject) => {
      setTimeout(() => reject(timeoutError), 5000);
    }));

    const assertion = expect(fetchProducts()).rejects.toMatchObject({
      constructor: ApiError,
      type: ErrorType.TIMEOUT,
    });
    await vi.advanceTimersByTimeAsync(5000);
    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("преобразует сетевое отклонение fetch в ApiError типа NETWORK", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(fetchProducts()).rejects.toMatchObject({
      constructor: ApiError,
      type: ErrorType.NETWORK,
    });
  });

  it("при ответе 500 делает ровно три попытки и бросает ApiError типа SERVER", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 });

    const assertion = expect(fetchProductsWithRetry()).rejects.toMatchObject({
      constructor: ApiError,
      type: ErrorType.SERVER,
      statusCode: 500,
    });
    await vi.runAllTimersAsync();
    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("при ответе 429 сообщает RATE_LIMIT и использует кеш без повторного запроса", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      headers: { get: vi.fn().mockReturnValue("60") },
    });
    storage.setItem(CACHE_KEY, JSON.stringify({ data: CACHED_CATALOG, timestamp: Date.now() }));

    await expect(fetchProducts()).rejects.toMatchObject({
      constructor: ApiError,
      type: ErrorType.RATE_LIMIT,
      statusCode: 429,
      retryAfter: "60",
    });
    fetchMock.mockClear();

    const outcome = fetchProductsWithRetry().then(
      (value) => ({ value }),
      (error) => ({ error }),
    );
    await vi.runAllTimersAsync();
    const result = await outcome;
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(storage.getItem).toHaveBeenCalledWith(CACHE_KEY);
    expect(result).toEqual({ value: { ...CACHED_CATALOG, fromCache: true } });
  });

  it("при ответе 401 бросает ApiError типа CLIENT без retry", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401 });

    const assertion = expect(fetchProductsWithRetry()).rejects.toMatchObject({
      constructor: ApiError,
      type: ErrorType.CLIENT,
      statusCode: 401,
    });
    await vi.runAllTimersAsync();
    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("бросает ApiError типа INVALID_RESPONSE при ответе 200 без массива items", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ total: 0, page: 1 }),
    });

    await expect(fetchProducts()).rejects.toMatchObject({
      constructor: ApiError,
      type: ErrorType.INVALID_RESPONSE,
    });
  });

  it("возвращает кеш с fromCache: true после исчерпания всех retry-попыток", async () => {
    fetchMock.mockRejectedValue(new TypeError("Нет сети"));
    storage.setItem(CACHE_KEY, JSON.stringify({ data: CACHED_CATALOG, timestamp: Date.now() }));

    const assertion = expect(fetchProductsWithRetry()).resolves.toEqual({
      ...CACHED_CATALOG,
      fromCache: true,
    });
    await vi.runAllTimersAsync();
    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(storage.getItem).toHaveBeenCalledWith(CACHE_KEY);
  });

  it("пробрасывает последнюю ошибку после исчерпания retry, если кеша нет", async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError("Первая ошибка"))
      .mockRejectedValueOnce(new TypeError("Вторая ошибка"))
      .mockRejectedValueOnce(new TypeError("Последняя ошибка"));

    const assertion = expect(fetchProductsWithRetry()).rejects.toMatchObject({
      constructor: ApiError,
      type: ErrorType.NETWORK,
      message: "Последняя ошибка",
    });
    await vi.runAllTimersAsync();
    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(storage.getItem).toHaveBeenCalledWith(CACHE_KEY);
  });
});
