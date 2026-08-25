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

describe("shop", () => {
  it("renders catalog with products and add-to-cart", () => {
    renderApp("/");
    expect(screen.getByRole("heading", { name: "Каталог" })).toBeTruthy();
    expect(screen.getByText("Футболка с принтом")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "В корзину" }).length).toBeGreaterThan(0);
  });

  it("opens product page with description and quantity", () => {
    renderApp("/product/1");
    expect(screen.getByRole("heading", { name: "Футболка с принтом" })).toBeTruthy();
    expect(
      screen.getByText("Хлопковая футболка с авторским принтом. Размеры S–XL."),
    ).toBeTruthy();
    expect(screen.getByLabelText("Увеличить количество")).toBeTruthy();
  });

  it("adds a product to the cart and shows the total", () => {
    renderApp("/");
    fireEvent.click(screen.getAllByRole("button", { name: "В корзину" })[0]);
    fireEvent.click(screen.getByRole("link", { name: /Корзина/ }));
    expect(screen.getByRole("heading", { name: "Корзина" })).toBeTruthy();
    expect(screen.getByText("Футболка с принтом")).toBeTruthy();
    expect(screen.getByText("Итого:")).toBeTruthy();
  });
});
