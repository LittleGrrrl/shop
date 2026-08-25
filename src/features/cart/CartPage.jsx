import { Link } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import { calcDiscountPrice, formatPrice } from "../../utils/price.js";
import styles from "./CartPage.module.css";

function CartPage() {
  const { items, removeFromCart, getTotal } = useCart();

  if (items.length === 0) {
    return (
      <section>
        <h1 className={styles.title}>Корзина</h1>
        <p>
          Корзина пуста. <Link to="/">Перейти в каталог</Link>
        </p>
      </section>
    );
  }

  return (
    <section>
      <h1 className={styles.title}>Корзина</h1>
      <ul className={styles.list}>
        {items.map((item) => {
          const unitPrice = calcDiscountPrice(item.price, item.discount);
          return (
            <li key={item.id} className={styles.item}>
              <div>
                <span className={styles.name}>{item.name}</span>
                <span className={styles.quantity}>× {item.quantity}</span>
              </div>
              <div className={styles.itemRight}>
                <span className={styles.itemPrice}>
                  {formatPrice(unitPrice * item.quantity)}
                </span>
                <button
                  className={styles.remove}
                  onClick={() => removeFromCart(item.id)}
                >
                  Удалить
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <div className={styles.total}>
        <span>Итого:</span>
        <span className={styles.totalPrice}>{formatPrice(getTotal())}</span>
      </div>
    </section>
  );
}

export default CartPage;
