import { act, renderHook, waitFor } from "@testing-library/react";
import { useProducts } from "../useProducts.js";
import { fetchProductsWithRetry } from "../../api/catalog.js";
import { ApiError } from "../../api/ApiError.js";

vi.mock("../../api/catalog.js", () => ({ fetchProductsWithRetry: vi.fn() }));
beforeEach(() => vi.resetAllMocks());

it("loads all pages", async () => {
  fetchProductsWithRetry.mockResolvedValueOnce({ items: [{ id: 1 }], total: 2, page: 1 })
    .mockResolvedValueOnce({ items: [{ id: 2 }], total: 2, page: 2 });
  const { result } = renderHook(() => useProducts());
  expect(result.current.status).toBe("loading");
  await waitFor(() => expect(result.current.status).toBe("success"));
  expect(result.current.products).toEqual([{ id: 1 }, { id: 2 }]);
  expect(fetchProductsWithRetry.mock.calls[1][0]).toEqual({ page: 2 });
});

it("exposes retrying and fallback states", async () => {
  let finish;
  fetchProductsWithRetry.mockImplementation((_, { onRetry }) => {
    onRetry();
    return new Promise((resolve) => { finish = resolve; });
  });
  const { result } = renderHook(() => useProducts());
  expect(result.current.status).toBe("retrying");
  await act(async () => finish({ items: [{ id: 1 }], total: 1, fromCache: true }));
  expect(result.current.status).toBe("fallback");
});

it("supports manual retry after failure", async () => {
  const error = new ApiError("NETWORK_ERROR", "offline");
  fetchProductsWithRetry.mockRejectedValueOnce(error)
    .mockResolvedValueOnce({ items: [], total: 0 });
  const { result } = renderHook(() => useProducts());
  await waitFor(() => expect(result.current.status).toBe("failed"));
  expect(result.current.error).toBe(error);
  act(() => result.current.retry());
  expect(result.current.status).toBe("loading");
  expect(result.current.error).toBeNull();
  await waitFor(() => expect(result.current.status).toBe("success"));
});

it("shows a cached page even when the cache does not contain the entire catalog", async () => {
  fetchProductsWithRetry.mockResolvedValue({
    items: [{ id: 2 }], total: 100, page: 2, fromCache: true,
  });
  const { result } = renderHook(() => useProducts());
  await waitFor(() => expect(result.current.status).toBe("fallback"));
  expect(result.current.products).toEqual([{ id: 2 }]);
  expect(result.current.error).toBeNull();
  expect(fetchProductsWithRetry).toHaveBeenCalledTimes(1);
});

it("ignores the previous request and its retry callback after a manual restart", async () => {
  let finish;
  let onRetry;
  fetchProductsWithRetry.mockImplementationOnce((_, options) => {
    onRetry = options.onRetry;
    return new Promise((resolve) => { finish = resolve; });
  }).mockResolvedValueOnce({ items: [{ id: 2 }], total: 1 });
  const { result } = renderHook(() => useProducts());
  act(() => result.current.retry());
  await waitFor(() => expect(result.current.status).toBe("success"));
  await act(async () => {
    onRetry();
    finish({ items: [{ id: 1 }], total: 1 });
  });
  expect(result.current.status).toBe("success");
  expect(result.current.products).toEqual([{ id: 2 }]);
});

it("rejects incomplete pagination", async () => {
  fetchProductsWithRetry.mockResolvedValue({ items: [], total: 2 });
  const { result } = renderHook(() => useProducts());
  await waitFor(() => expect(result.current.error?.code).toBe("INVALID_RESPONSE"));
});
