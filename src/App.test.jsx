import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App.jsx";

function renderApp(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

beforeEach(() => vi.stubEnv("VITE_USE_MOCK_DATA", "true"));
afterEach(() => vi.unstubAllEnvs());

describe("shop", () => {
  it("renders catalog with products and add-to-cart", async () => {
    renderApp("/");
    expect(screen.getByRole("heading", { name: "Каталог" })).toBeTruthy();
    expect(await screen.findByText("Футболка с принтом")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "В корзину" }).length).toBeGreaterThan(0);
  });

  it("opens product page with description and quantity", async () => {
    renderApp("/product/1");
    expect(await screen.findByRole("heading", { name: "Футболка с принтом" })).toBeTruthy();
    expect(
      screen.getByText("Хлопковая футболка с авторским принтом. Размеры S–XL."),
    ).toBeTruthy();
    expect(screen.getByLabelText("Увеличить количество")).toBeTruthy();
  });

  it("adds a product to the cart and shows the total", async () => {
    renderApp("/");
    fireEvent.click((await screen.findAllByRole("button", { name: "В корзину" }))[0]);
    fireEvent.click(screen.getByRole("link", { name: /Корзина/ }));
    expect(screen.getByRole("heading", { name: "Корзина" })).toBeTruthy();
    expect(await screen.findByText("Футболка с принтом")).toBeTruthy();
    expect(screen.getByText("Итого:")).toBeTruthy();
  });
});

it("shows API failure and reloads the catalog on demand", async () => {
  vi.stubEnv("VITE_USE_MOCK_DATA", "false");
  const { default: data } = await import("./api/mocks/catalog.json");
  vi.stubGlobal("fetch", vi.fn()
    .mockResolvedValueOnce({ ok: false, status: 401, headers: { get: () => null } })
    .mockResolvedValueOnce({ ok: true, json: async () => data }));
  try {
    renderApp();
    expect(screen.getByRole("status").textContent).toContain("Загружаем товары");
    expect((await screen.findByRole("alert")).textContent).toContain("Не удалось загрузить каталог");
    expect(screen.queryByText("Товары не найдены")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Повторить загрузку" }));
    expect(await screen.findByText("Футболка с принтом")).toBeTruthy();
  } finally {
    vi.unstubAllGlobals();
  }
});
