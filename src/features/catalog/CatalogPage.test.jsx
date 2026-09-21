import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts.js";
import CatalogPage from "./CatalogPage.jsx";

vi.mock("../../hooks/useProducts.js", () => ({ useProducts: vi.fn() }));
vi.mock("../cart/CartContext.jsx", () => ({ useCart: () => ({ addToCart: vi.fn() }) }));

function renderCatalog(state) {
  useProducts.mockReturnValue({ products: [], error: null, retry: vi.fn(), ...state });
  render(<MemoryRouter><CatalogPage /></MemoryRouter>);
}

describe("catalog loading states", () => {
  it.each([
    ["loading", "Загружаем каталог..."],
    ["retrying", "Повторяем запрос..."],
  ])("shows %s without an empty results message", (status, message) => {
    renderCatalog({ status });
    expect(screen.getByRole("status").textContent).toBe(message);
    expect(screen.queryByText("Товары не найдены")).toBeNull();
  });

  it("shows cached products with a notice", () => {
    renderCatalog({ status: "fallback", products: [{ id: 42, name: "Товар из кеша", category: "Кеш", price: 100, discount: 0, inStock: true }] });
    expect(screen.getByRole("status").textContent).toBe("Показаны данные из кеша — API временно недоступен.");
    expect(screen.getByRole("heading", { name: "Товар из кеша" })).toBeTruthy();
  });

  it("shows an error and triggers manual retry", () => {
    const retry = vi.fn();
    renderCatalog({ status: "failed", error: new Error("Сеть недоступна"), retry });
    expect(screen.getByRole("alert").textContent).toContain("Сеть недоступна");
    fireEvent.click(screen.getByRole("button", { name: "Повторить загрузку" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
