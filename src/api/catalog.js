import { ApiError } from "./ApiError.js";
import { adaptProductList } from "./adaptProductList.js";
import mockData from "./mocks/catalog.json";

const TIMEOUT_MS = 5000;
const MAX_ATTEMPTS = 3;
const CACHE_KEY = "products_cache";
const REQUEST_LIMIT = 100;
const WINDOW_MS = 60000;
const requestTimes = [];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function reserveRequest() {
  for (;;) {
    const now = Date.now();
    while (requestTimes.length && requestTimes[0] <= now - WINDOW_MS) requestTimes.shift();
    if (requestTimes.length < REQUEST_LIMIT) {
      requestTimes.push(now);
      return;
    }
    await wait(Math.max(1, requestTimes[0] + WINDOW_MS - now));
  }
}

async function request(url) {
  const controller = new AbortController();
  let timer;
  try {
    return await Promise.race([
      (async () => {
        const response = await fetch(url, {
          headers: { "X-Api-Key": import.meta.env.VITE_API_KEY ?? "" },
          signal: controller.signal,
        });
        if (!response.ok) {
          const seconds = Number(response.headers.get("Retry-After"));
          throw new ApiError("HTTP_ERROR", `Ошибка каталога: ${response.status}`, {
            status: response.status,
            retryAfter: Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 0,
          });
        }
        try {
          return await response.json();
        } catch {
          throw new ApiError("INVALID_RESPONSE", "Ответ каталога не является JSON");
        }
      })(),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          reject(new ApiError("TIMEOUT", "Время ожидания каталога истекло"));
          controller.abort();
        }, TIMEOUT_MS);
      }),
    ]);
  } catch (error) {
    throw error instanceof ApiError ? error : new ApiError("NETWORK_ERROR", "Каталог недоступен");
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchProducts({ category, page = 1, limit = 50 } = {}) {
  try {
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50 ||
        (category !== undefined && typeof category !== "string")) {
      throw new ApiError("INVALID_PARAMS", "Некорректные параметры каталога");
    }
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (category !== undefined) params.set("category", category);
    let raw;
    if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
      const items = mockData.items.filter((item) => category === undefined || item.category === category);
      raw = { items: items.slice((page - 1) * limit, page * limit), total: items.length, page };
    } else {
      await reserveRequest();
      raw = await request(`/api/v2/products?${params}`);
    }
    const result = adaptProductList(raw);
    if (result.page !== page || result.items.length > limit) {
      throw new ApiError("INVALID_RESPONSE", "Некорректная страница каталога");
    }
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(result));
    } catch {
      // Storage may be unavailable or full; the response is still usable.
    }
    return result;
  } catch (error) {
    throw error instanceof ApiError ? error : new ApiError("CLIENT_ERROR", "Не удалось загрузить каталог");
  }
}

export async function fetchProductsWithRetry(params = {}, { onRetry } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      return await fetchProducts(params);
    } catch (error) {
      const retryable = ["TIMEOUT", "NETWORK_ERROR"].includes(error.code) ||
        [500, 502, 503].includes(error.status);
      if (error.status === 429) {
        lastError = error;
        break;
      }
      if (!retryable) throw error;
      lastError = error;
    }
    if (attempt < MAX_ATTEMPTS) {
      onRetry?.(attempt);
      await wait(attempt * 1000);
    }
  }
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && Array.isArray(cached.items) && Number.isInteger(cached.total) &&
        cached.total >= cached.items.length && Number.isInteger(cached.page) && cached.page > 0) {
      return { ...cached, fromCache: true };
    }
  } catch {
    // An unavailable or malformed cache must not replace the request error.
  }
  throw lastError;
}

export async function getProducts(params = {}, options = {}) {
  const result = await fetchProductsWithRetry(params, options);
  return { ...result, fallback: result.fromCache === true };
}
