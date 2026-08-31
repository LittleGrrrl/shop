import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import { calcDiscountPrice, formatPrice } from "../../utils/price.js";
import { applyDiscount, getSubtotal } from "../../utils/cart-utils.js";
import { validatePromo } from "../../data/promo.js";
import styles from "./CartPage.module.css";

const APPLIED_PROMO_KEY = "appliedPromo";

function getAppliedPromo() {
  const savedPromo = localStorage.getItem(APPLIED_PROMO_KEY);

  if (savedPromo === null) return null;

  try {
    const appliedPromo = JSON.parse(savedPromo);

    if (typeof appliedPromo?.code !== "string") {
      localStorage.removeItem(APPLIED_PROMO_KEY);
      return null;
    }

    const result = validatePromo(appliedPromo.code);

    if (!result.valid) {
      localStorage.removeItem(APPLIED_PROMO_KEY);
      return null;
    }

    return {
      code: appliedPromo.code.trim().toUpperCase(),
      discount: result.discount,
    };
  } catch {
    localStorage.removeItem(APPLIED_PROMO_KEY);
    return null;
  }
}

function CartPage() {
  const { items, removeFromCart } = useCart();
  const [promoResult, setPromoResult] = useState(() => {
    const appliedPromo = getAppliedPromo();

    return appliedPromo
      ? { valid: true, discount: appliedPromo.discount }
      : null;
  });
  const [promoCode, setPromoCode] = useState(() => {
    const appliedPromo = getAppliedPromo();
    return appliedPromo?.code ?? "";
  });

  useEffect(() => {
    if (items.length > 0) return;

    setPromoCode("");
    setPromoResult(null);
    localStorage.removeItem(APPLIED_PROMO_KEY);
  }, [items.length]);

  function handlePromoChange(event) {
    setPromoCode(event.target.value);
    setPromoResult(null);
  }

  function handlePromoSubmit(event) {
    event.preventDefault();
    const result = validatePromo(promoCode);
    setPromoResult(result);

    if (result.valid) {
      const normalizedCode = promoCode.trim().toUpperCase();
      setPromoCode(normalizedCode);
      localStorage.setItem(
        APPLIED_PROMO_KEY,
        JSON.stringify({ code: normalizedCode, discount: result.discount }),
      );
    }
  }

  function handlePromoRemove() {
    setPromoCode("");
    setPromoResult(null);
    localStorage.removeItem(APPLIED_PROMO_KEY);
  }

  const isPromoApplied = promoResult?.valid === true;
  const discount = isPromoApplied ? promoResult.discount : 0;
  const subtotal = getSubtotal(items);
  const totalPrice = applyDiscount(subtotal, discount);
  const discountAmount = subtotal - totalPrice;

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
      <div className={styles.summary}>
        {isPromoApplied && (
          <div className={styles.discount}>
            <span>{`Скидка: −${discount}%`}</span>
            <span>{`−${formatPrice(discountAmount)}`}</span>
          </div>
        )}
        <div className={styles.total}>
          <span>Итого:</span>
          <span className={styles.totalPrice}>{formatPrice(totalPrice)}</span>
        </div>
      </div>
      <form className={styles.promo} onSubmit={handlePromoSubmit}>
        <label className={styles.promoLabel} htmlFor="promo-code">
          Промокод
        </label>
        <div className={styles.promoControls}>
          <input
            className={`${styles.promoInput} ${
              isPromoApplied ? styles.promoInputApplied : ""
            }`}
            id="promo-code"
            name="promoCode"
            type="text"
            value={promoCode}
            onChange={handlePromoChange}
            placeholder="Введите промокод"
            readOnly={isPromoApplied}
          />
          {isPromoApplied ? (
            <button
              className={styles.promoRemove}
              type="button"
              onClick={handlePromoRemove}
            >
              Удалить
            </button>
          ) : (
            <button
              className={styles.promoApply}
              type="submit"
              disabled={promoCode.trim() === ""}
            >
              Применить
            </button>
          )}
        </div>
        <div className={styles.promoMessage} aria-live="polite">
          {promoResult && (
            <p
              className={
                promoResult.valid ? styles.promoSuccess : styles.promoError
              }
            >
              {promoResult.valid
                ? `Промокод применён: −${promoResult.discount}%`
                : "Промокод недействителен"}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}

export default CartPage;
