import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice, products } from '../data/products.js';
import styles from './Catalog.module.css';

export default function Catalog() {
  const { addToCart } = useCart();
  const [sort, setSort] = useState(null);

  const visibleProducts = useMemo(() => {
    if (!sort) {
      return products;
    }

    return [...products].sort((a, b) =>
      sort === 'asc' ? a.price - b.price : b.price - a.price,
    );
  }, [sort]);

  return (
    <section>
      <h1 className={styles.title}>Каталог</h1>
      <div className={styles.sort}>
        <button
          type="button"
          className={sort === 'asc' ? styles.sortActive : styles.sortButton}
          onClick={() => setSort('asc')}
        >
          Дешевле
        </button>
        <button
          type="button"
          className={sort === 'desc' ? styles.sortActive : styles.sortButton}
          onClick={() => setSort('desc')}
        >
          Дороже
        </button>
      </div>
      <div className={styles.grid}>
        {visibleProducts.map((product) => (
          <article key={product.id} className={styles.card}>
            <Link to={`/product/${product.id}`} className={styles.info}>
              <h2 className={styles.name}>{product.name}</h2>
              <p className={styles.price}>{formatPrice(product.price)}</p>
            </Link>
            <button
              type="button"
              className={styles.button}
              onClick={() => addToCart(product.id)}
            >
              В корзину
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
