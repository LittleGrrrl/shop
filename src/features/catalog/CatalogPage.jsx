import { products } from "../../data/products.js";
import ProductCard from "./ProductCard.jsx";
import styles from "./CatalogPage.module.css";

function CatalogPage() {
  return (
    <section>
      <h1 className={styles.title}>Каталог</h1>
      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default CatalogPage;
