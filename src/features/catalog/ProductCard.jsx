import { Link } from "react-router-dom";
import { useCart } from "../cart/CartContext.jsx";
import { calcDiscountPrice, formatPrice } from "../../utils/price.js";
import styles from "./ProductCard.module.css";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const finalPrice = calcDiscountPrice(product.price, product.discount);

  return (
    <article className={styles.card}>
      <div className={styles.imagePlaceholder} />
      <h2 className={styles.name}>
        <Link to={`/product/${product.id}`}>{product.name}</Link>
      </h2>
      <p className={styles.price}>
        {product.discount > 0 && (
          <span className={styles.oldPrice}>{formatPrice(product.price)}</span>
        )}
        {formatPrice(finalPrice)}
      </p>
      <button
        className={styles.button}
        disabled={!product.inStock}
        onClick={() => addToCart(product)}
      >
        {product.inStock ? "В корзину" : "Нет в наличии"}
      </button>
    </article>
  );
}

export default ProductCard;
