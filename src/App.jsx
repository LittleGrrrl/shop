import { Routes, Route, Link, useLocation } from "react-router-dom";
import { CartProvider, useCart } from "./features/cart/CartContext.jsx";
import CatalogPage from "./features/catalog/CatalogPage.jsx";
import ProductPage from "./features/catalog/ProductPage.jsx";
import CartPage from "./features/cart/CartPage.jsx";
import styles from "./App.module.css";

function Header() {
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        HTML Academy Shop
      </Link>
      <nav className={styles.nav}>
        <Link to="/">Каталог</Link>
        <Link to="/cart">
          Корзина
          {count > 0 && (
            <span key={count} className={styles.cartCount}>
              {count}
            </span>
          )}
        </Link>
      </nav>
    </header>
  );
}

function App() {
  const location = useLocation();

  return (
    <CartProvider>
      <Header />
      <main className={styles.main}>
        <div key={location.pathname} className={styles.page}>
          <Routes location={location}>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </div>
      </main>
    </CartProvider>
  );
}

export default App;
