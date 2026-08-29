import { useEffect, useRef, useState } from "react";
import styles from "./CatalogFilters.module.css";

const PRICE_FILTER_DELAY = 400;

function CatalogFilters({ availableCategories, filters, onChange }) {
  const [minPrice, setMinPrice] = useState(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice);
  const filtersRef = useRef(filters);
  const onChangeRef = useRef(onChange);

  filtersRef.current = filters;
  onChangeRef.current = onChange;

  useEffect(() => {
    setMinPrice(filters.minPrice);
  }, [filters.minPrice]);

  useEffect(() => {
    setMaxPrice(filters.maxPrice);
  }, [filters.maxPrice]);

  useEffect(() => {
    if (
      minPrice === filtersRef.current.minPrice &&
      maxPrice === filtersRef.current.maxPrice
    ) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      onChangeRef.current({
        ...filtersRef.current,
        minPrice,
        maxPrice,
      });
    }, PRICE_FILTER_DELAY);

    return () => window.clearTimeout(timeoutId);
  }, [minPrice, maxPrice]);

  const handleCategoryChange = (category, isChecked) => {
    const categories = isChecked
      ? [...filters.categories, category]
      : filters.categories.filter((selectedCategory) => selectedCategory !== category);

    onChange({ ...filters, categories });
  };

  return (
    <div className={styles.filters} aria-label="Фильтры каталога">
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Цена</legend>
        <div className={styles.priceFields}>
          <label className={styles.priceField}>
            <span>От</span>
            <input
              className={styles.priceInput}
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
            />
          </label>
          <label className={styles.priceField}>
            <span>До</span>
            <input
              className={styles.priceInput}
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Категории</legend>
        <div className={styles.categories}>
          {availableCategories.map((category) => (
            <label className={styles.category} key={category}>
              <input
                className={styles.checkbox}
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={(event) => handleCategoryChange(category, event.target.checked)}
              />
              {category}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

export default CatalogFilters;
