import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice, products } from '../data/products.js';
import styles from './Catalog.module.css';

export default function Catalog() {
  const { addToCart } = useCart();

  return (
    <section>
      <h1 className={styles.title}>Каталог</h1>
      <div className={styles.grid}>
        {products.map((product) => (
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
