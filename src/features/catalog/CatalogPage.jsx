import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts.js";
import { filterProducts } from "../../utils/filters.js";
import CatalogFilters from "./CatalogFilters.jsx";
import ProductCard from "./ProductCard.jsx";
import styles from "./CatalogPage.module.css";

function CatalogPage() {
  const { products, status, error, retry } = useProducts();
  const availableCategories = [...new Set(products.map((product) => product.category))];
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = {
    minPrice: searchParams.get("min_price") ?? "",
    maxPrice: searchParams.get("max_price") ?? "",
    categories: (searchParams.get("categories") ?? "")
      .split(",")
      .filter((category) => availableCategories.includes(category)),
  };
  const filteredProducts = filterProducts(products, filters);
  const visibleProducts = showOnlyInStock
    ? filteredProducts.filter((product) => product.inStock)
    : filteredProducts;

  const handleFiltersChange = (nextFilters) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (nextFilters.minPrice === "") {
      nextSearchParams.delete("min_price");
    } else {
      nextSearchParams.set("min_price", nextFilters.minPrice);
    }

    if (nextFilters.maxPrice === "") {
      nextSearchParams.delete("max_price");
    } else {
      nextSearchParams.set("max_price", nextFilters.maxPrice);
    }

    if (nextFilters.categories.length === 0) {
      nextSearchParams.delete("categories");
    } else {
      nextSearchParams.set("categories", nextFilters.categories.join(","));
    }

    setSearchParams(nextSearchParams, { replace: true });
  };

  const handleReset = () => {
    setShowOnlyInStock(false);
    handleFiltersChange({ minPrice: "", maxPrice: "", categories: [] });
  };

  if (status === "loading" || status === "retrying" || status === "failed") {
    return (
      <section>
        <h1 className={styles.title}>Каталог</h1>
        {status === "failed" ? (
          <div className={styles.notice} role="alert">
            <p>{error?.message || "Не удалось загрузить каталог."}</p>
            <button className={styles.resetButton} type="button" onClick={retry}>
              Повторить загрузку
            </button>
          </div>
        ) : (
          <p className={styles.notice} role="status">
            {status === "loading" ? "Загружаем каталог..." : "Повторяем запрос..."}
          </p>
        )}
      </section>
    );
  }

  return (
    <section>
      <h1 className={styles.title}>Каталог</h1>
      {status === "fallback" && (
        <p className={styles.notice} role="status">
          Показаны данные из кеша — API временно недоступен.
        </p>
      )}
      <CatalogFilters
        availableCategories={availableCategories}
        filters={filters}
        onChange={handleFiltersChange}
      />
      <label className={styles.stockFilter}>
        <input
          className={styles.stockFilterInput}
          type="checkbox"
          checked={showOnlyInStock}
          onChange={(event) => setShowOnlyInStock(event.target.checked)}
        />
        Показывать только в наличии
      </label>
      <p className={styles.resultCount}>Найдено: {visibleProducts.length}</p>
      {visibleProducts.length > 0 ? (
        <div className={styles.grid}>
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>Товары не найдены</p>
          <button className={styles.resetButton} type="button" onClick={handleReset}>
            Сбросить фильтры
          </button>
        </div>
      )}
    </section>
  );
}

export default CatalogPage;
