import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { products } from "../../data/products.js";
import { useCart } from "../cart/CartContext.jsx";
import { QuantitySelector } from "../../components/QuantitySelector.jsx";
import { calcDiscountPrice, formatPrice } from "../../utils/price.js";
import styles from "./ProductPage.module.css";

function ProductPage() {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <p>
        Товар не найден. <Link to="/">Вернуться в каталог</Link>
      </p>
    );
  }

  const finalPrice = calcDiscountPrice(product.price, product.discount);

  return (
    <section className={styles.product}>
      <div className={styles.imagePlaceholder} />
      <div className={styles.info}>
        <h1 className={styles.name}>{product.name}</h1>
        <p className={styles.description}>{product.description}</p>
        <p className={styles.price}>
          {product.discount > 0 && (
            <span className={styles.oldPrice}>{formatPrice(product.price)}</span>
          )}
          {formatPrice(finalPrice)}
        </p>
        {product.inStock && (
          <QuantitySelector onChange={setQuantity} />
        )}
        <button
          className={styles.button}
          disabled={!product.inStock}
          onClick={() => addToCart(product, quantity)}
        >
          {product.inStock ? "В корзину" : "Нет в наличии"}
        </button>
        <Link to="/" className={styles.back}>
          ← Каталог
        </Link>
      </div>
    </section>
  );
}

export default ProductPage;
