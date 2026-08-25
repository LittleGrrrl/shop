import { useState } from "react";
import { products } from "../../data/products.js";
import ProductCard from "./ProductCard.jsx";
import styles from "./CatalogPage.module.css";

function CatalogPage() {
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const visibleProducts = showOnlyInStock
    ? products.filter((product) => product.inStock)
    : products;

  return (
    <section>
      <h1 className={styles.title}>Каталог</h1>
      <label className={styles.stockFilter}>
        <input
          className={styles.stockFilterInput}
          type="checkbox"
          checked={showOnlyInStock}
          onChange={(event) => setShowOnlyInStock(event.target.checked)}
        />
        Показывать только в наличии
      </label>
      <div className={styles.grid}>
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default CatalogPage;
