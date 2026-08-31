import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../App.jsx";

describe("CartPage promo discount", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("updates the total and restores it when the promo code is removed", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "В корзину" })[0]);
    fireEvent.click(screen.getByRole("link", { name: /Корзина/ }));

    const promoInput = screen.getByLabelText("Промокод");
    const promoForm = promoInput.closest("form");

    fireEvent.change(promoInput, { target: { value: "SALE15" } });
    fireEvent.click(within(promoForm).getByRole("button", { name: "Применить" }));

    expect(screen.getByText("Скидка: −15%")).toBeTruthy();
    expect(screen.getByText("−299 ₽")).toBeTruthy();
    expect(screen.getByText(/1\s693 ₽/)).toBeTruthy();
    expect(JSON.parse(localStorage.getItem("appliedPromo"))).toEqual({
      code: "SALE15",
      discount: 15,
    });

    fireEvent.click(within(promoForm).getByRole("button", { name: "Удалить" }));

    expect(screen.queryByText("Скидка: −15%")).toBeNull();
    expect(screen.queryByText("−299 ₽")).toBeNull();
    expect(screen.queryByText(/1\s693 ₽/)).toBeNull();
    expect(screen.getAllByText(/1\s992 ₽/)).toHaveLength(2);
    expect(localStorage.getItem("appliedPromo")).toBeNull();
  });

  it("restores an applied promo code from localStorage", () => {
    localStorage.setItem(
      "appliedPromo",
      JSON.stringify({ code: "SALE15", discount: 15 }),
    );

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "В корзину" })[0]);
    fireEvent.click(screen.getByRole("link", { name: /Корзина/ }));

    expect(screen.getByLabelText("Промокод").value).toBe("SALE15");
    expect(screen.getByText("Скидка: −15%")).toBeTruthy();
    expect(screen.getByText(/1\s693 ₽/)).toBeTruthy();
  });
});
