import styles from "./CatalogStatus.module.css";

export default function CatalogStatus({ status, retry }) {
  if (status === "success") return null;
  const messages = {
    loading: "Загружаем товары…",
    retrying: "Повторяем запрос…",
    fallback: "Показаны данные из кеша",
    failed: "Не удалось загрузить каталог.",
  };
  const descriptions = {
    retrying: "Первая попытка не удалась. Пробуем ещё раз автоматически.",
    fallback: "Каталог временно недоступен. Сохранённые товары показаны ниже; цены и наличие могут быть устаревшими.",
    failed: "Не удалось получить товары с сервера или из кеша. Попробуйте загрузить каталог снова.",
  };
  return (
    <div className={`${styles.status} ${styles[status]}`} role={status === "failed" ? "alert" : "status"}>
      <span className={styles.indicator} aria-hidden="true">
        {status === "loading" ? "…" : status === "retrying" ? "↻" : status === "fallback" ? "!" : "×"}
      </span>
      <div>
        <p className={styles.title}>{messages[status]}</p>
        {descriptions[status] && <p className={styles.description}>{descriptions[status]}</p>}
        {["failed", "fallback"].includes(status) && (
          <button className={styles.button} type="button" onClick={retry}>Повторить загрузку</button>
        )}
      </div>
    </div>
  );
}
