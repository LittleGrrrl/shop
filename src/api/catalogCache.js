import { adaptProductList } from "./adaptProductList.js";

const PREFIX = "catalog:v2:";

export function readCatalogCache(key) {
  try {
    const data = JSON.parse(localStorage.getItem(PREFIX + key));
    return adaptProductList(data);
  } catch {
    return null;
  }
}

export function writeCatalogCache(key, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
  } catch {
    // Storage may be unavailable or full; a valid API response is still usable.
  }
}
