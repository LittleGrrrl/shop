import { useState } from "react";
import styles from "./QuantitySelector.module.css";

export function QuantitySelector({ max = 10, onChange }) {
  const [quantity, setQuantity] = useState(1);

  function update(next) {
    if (next < 1 || next > max) return;
    setQuantity(next);
    onChange?.(next);
  }

  return (
    <div className={styles.selector}>
      <button
        type="button"
        className={styles.button}
        onClick={() => update(quantity - 1)}
        disabled={quantity <= 1}
        aria-label="Уменьшить количество"
      >
        −
      </button>
      <span key={quantity} className={styles.value} aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        className={styles.button}
        onClick={() => update(quantity + 1)}
        disabled={quantity >= max}
        aria-label="Увеличить количество"
      >
        +
      </button>
    </div>
  );
}
