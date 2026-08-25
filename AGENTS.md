# AGENTS.md

## Стек проекта

- **Язык:** JavaScript (ESM, `"type": "module"`), JSX. TypeScript не используется.
- **UI:** React 19 (`react`, `react-dom`).
- **Роутинг:** React Router DOM 7 (`react-router-dom`). Маршруты: каталог `/`, карточка товара `/product/:id`, корзина `/cart`.
- **Сборка:** Vite 7, плагин `@vitejs/plugin-react`. Dev: `npm run dev`, сборка: `npm run build`.
- **Стили:** глобальный CSS (`src/index.css`) и CSS Modules рядом с компонентами (`*.module.css`).
- **Состояние корзины:** React Context (`src/context/CartContext.jsx`). Данные каталога — локальный модуль `src/data/products.js`.
- **Node:** версия из `.nvmrc` (24).

## Менеджер пакетов

Использовать **npm**. В репозитории есть `package-lock.json`. Не переключаться на yarn, pnpm или bun.

## Запреты

- Не добавлять зависимости без явного разрешения.
- Не менять конфиг сборки (`vite.config.js`, `index.html`, скрипты в `package.json`).
- Не трогать файлы за пределами папки, указанной в задаче.

## Проверка после изменений

После правок команды должны завершаться без ошибок:

```bash
npm test
npm run build
```
