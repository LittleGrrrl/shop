import { useCallback, useEffect, useState } from "react";
import { fetchProductsWithRetry } from "../api/catalog.js";
import { ApiError } from "../api/ApiError.js";
import { adaptProductList } from "../api/adaptProductList.js";
import mockData from "../api/mocks/catalog.json";

// Changing this flag requires restarting the dev server (or rebuilding production).
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === "true";

export function useProducts() {
  const [state, setState] = useState({ products: [], status: "loading", error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    const update = (next) => { if (active) setState(next); };
    async function load() {
      update({ products: [], status: "loading", error: null });
      try {
        if (USE_MOCK_DATA) {
          const { items } = adaptProductList(mockData);
          update({ products: items, status: "success", error: null });
          return;
        }
        const products = [];
        let page = 1;
        let total;
        do {
          const result = await fetchProductsWithRetry({ page }, {
            onRetry: () => update({ products: [], status: "retrying", error: null }),
          });
          if (!active) return;
          if (result.fromCache === true) {
            update({ products: result.items, status: "fallback", error: null });
            return;
          }
          total ??= result.total;
          if (total !== result.total || (result.items.length === 0 && products.length < total)) {
            throw new ApiError("INVALID_RESPONSE", "Неполный каталог");
          }
          products.push(...result.items);
          page += 1;
        } while (products.length < total);
        if (products.length !== total || new Set(products.map((item) => item.id)).size !== total) {
          throw new ApiError("INVALID_RESPONSE", "Несогласованные страницы каталога");
        }
        update({ products, status: "success", error: null });
      } catch (error) {
        update({ products: [], status: "failed", error });
      }
    }
    load();
    return () => { active = false; };
  }, [version]);

  const retry = useCallback(() => setVersion((value) => value + 1), []);

  return { ...state, retry };
}
