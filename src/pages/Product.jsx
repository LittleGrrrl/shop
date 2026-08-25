import { Link, Navigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice, getProductById } from '../data/products.js';
import styles from './Product.module.css';

export default function Product() {
  const { id } = useParams();
  const product = getProductById(id);
  const { addToCart } = useCart();

  if (!product) {
    return <Navigate to="/" replace />;
  }

  return (
    <article className={styles.card}>
      <Link to="/" className={styles.back}>
        ← Каталог
      </Link>
      <h1 className={styles.name}>{product.name}</h1>
      <p className={styles.description}>{product.description}</p>
      <p className={styles.price}>{formatPrice(product.price)}</p>
      <button
        type="button"
        className={styles.button}
        onClick={() => addToCart(product.id)}
      >
        В корзину
      </button>
    </article>
  );
}
