import { useCallback, useEffect, useState } from "react";
import { fetchProductsWithRetry } from "../api/catalog.js";
import { adaptProductList } from "../api/catalog-adapter.js";
import mockCatalog from "../api/mocks/catalog.json";

const MOCK_PRODUCTS = adaptProductList(mockCatalog).products;

export function useProducts(params = {}) {
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === "true";
  const [products, setProducts] = useState(useMockData ? MOCK_PRODUCTS : []);
  const [status, setStatus] = useState(useMockData ? "success" : "loading");
  const [error, setError] = useState(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const paramsKey = JSON.stringify(params);
  const retry = useCallback(() => setRequestVersion((version) => version + 1), []);

  useEffect(() => {
    if (useMockData) return;

    let active = true;
    setStatus("loading");
    setError(null);
    setProducts([]);

    async function loadProducts() {
      try {
        const result = await fetchProductsWithRetry(JSON.parse(paramsKey), {
          onRetry: () => {
            if (active) setStatus("retrying");
          },
        });
        if (!active) return;
        setProducts(result.products);
        setStatus(result.fromCache ? "fallback" : "success");
      } catch (requestError) {
        if (!active) return;
        setError(requestError);
        setStatus("failed");
      }
    }

    loadProducts();
    return () => {
      active = false;
    };
  }, [paramsKey, requestVersion, useMockData]);

  return { products, status, error, retry };
}

export default useProducts;
