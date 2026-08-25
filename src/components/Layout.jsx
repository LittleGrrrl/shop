import { NavLink, Outlet } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import styles from './Layout.module.css';

export default function Layout() {
  const { count } = useCart();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <NavLink to="/" className={styles.logo}>
          Магазин
        </NavLink>
        <nav className={styles.nav}>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? styles.active : styles.link)}
            end
          >
            Каталог
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) => (isActive ? styles.active : styles.link)}
          >
            Корзина{count > 0 ? ` (${count})` : ''}
          </NavLink>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
