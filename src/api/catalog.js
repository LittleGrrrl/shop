import { adaptProductList } from "./catalog-adapter.js";
import { ApiError, ErrorType, isRetryable } from "./errors.js";

const TIMEOUT_MS = 5000;
const MAX_ATTEMPTS = 3;
const PRODUCTS_CACHE_KEY = "products_cache";

export function saveToCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // Недоступное или переполненное хранилище не мешает загрузке товаров.
  }
}

export function loadFromCache(key) {
  try {
    const cached = localStorage.getItem(key);
    return cached === null ? null : JSON.parse(cached)?.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `/api/v2/products${query ? `?${query}` : ""}`;
  let response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Api-Key": import.meta.env.VITE_API_KEY,
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      let type = ErrorType.CLIENT;
      if (response.status === 429) {
        type = ErrorType.RATE_LIMIT;
      } else if (response.status >= 500 && response.status < 600) {
        type = ErrorType.SERVER;
      }
      const error = new ApiError(`HTTP ${response.status}`, type, response.status);
      if (response.status === 429) {
        error.retryAfter = response.headers.get("Retry-After");
      }
      throw error;
    }

    const result = adaptProductList(await response.json());
    saveToCache(PRODUCTS_CACHE_KEY, result);
    return result;
  } catch (error) {
    if (error?.name === "TimeoutError") {
      throw new ApiError(
        "Не удалось загрузить товары: время ожидания ответа превысило 5 секунд.",
        ErrorType.TIMEOUT,
      );
    }

    if (!response) {
      throw new ApiError(
        error?.message || "Не удалось загрузить товары: ошибка сети.",
        ErrorType.NETWORK,
      );
    }

    throw error;
  }
}

export async function fetchProductsWithRetry(params = {}, { onRetry } = {}) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      return await fetchProducts(params);
    } catch (error) {
      if (error.type === ErrorType.RATE_LIMIT) {
        lastError = error;
        break;
      }

      if (!isRetryable(error)) {
        throw error;
      }

      lastError = error;
      onRetry?.(attempt);
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }

  const cached = loadFromCache(PRODUCTS_CACHE_KEY);
  if (cached !== null) {
    return { ...cached, fromCache: true };
  }

  throw lastError;
}
