import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../data/products.js';
import styles from './Cart.module.css';

export default function Cart() {
  const { items, total } = useCart();

  const checkout = () => {
    window.alert('Заказ оформлен');
  };

  if (items.length === 0) {
    return (
      <section>
        <h1 className={styles.title}>Корзина</h1>
        <p className={styles.empty}>Корзина пуста.</p>
        <Link to="/" className={styles.link}>
          Перейти в каталог
        </Link>
      </section>
    );
  }

  return (
    <section>
      <h1 className={styles.title}>Корзина</h1>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.row}>
            <div>
              <Link to={`/product/${item.id}`} className={styles.name}>
                {item.name}
              </Link>
              <span className={styles.qty}> × {item.quantity}</span>
            </div>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <p className={styles.total}>Итого: {formatPrice(total)}</p>
      <button type="button" className={styles.button} onClick={checkout}>
        Оформить
      </button>
    </section>
  );
}
