import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuantitySelector } from "../QuantitySelector.jsx";

describe("QuantitySelector", () => {
  it("disables decrement at 1 and ignores repeated clicks", () => {
    const onChange = vi.fn();
    render(<QuantitySelector onChange={onChange} />);

    const decreaseButton = screen.getByRole("button", {
      name: "Уменьшить количество",
    });

    expect(screen.getByText("1")).toBeTruthy();
    expect(decreaseButton.disabled).toBe(true);

    fireEvent.click(decreaseButton);
    fireEvent.click(decreaseButton);

    expect(screen.getByText("1")).toBeTruthy();
    expect(decreaseButton.disabled).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disables both buttons and shows the limit immediately when max is 1", () => {
    render(<QuantitySelector max={1} />);

    expect(screen.getByText("1")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Уменьшить количество" }).disabled,
    ).toBe(true);
    expect(
      screen.getByRole("button", { name: "Увеличить количество" }).disabled,
    ).toBe(true);
    expect(screen.getByRole("status").textContent).toBe("Максимум 1 штук");
  });

  it("stops at max during ten consecutive increment clicks", () => {
    const MAX = 5;
    render(<QuantitySelector max={MAX} />);

    const increaseButton = screen.getByRole("button", {
      name: "Увеличить количество",
    });

    for (let click = 1; click <= 10; click += 1) {
      fireEvent.click(increaseButton);
      expect(screen.getByText(String(Math.min(1 + click, MAX)))).toBeTruthy();
    }

    expect(increaseButton.disabled).toBe(true);
    expect(screen.getByRole("status").textContent).toBe("Максимум 5 штук");
  });

  it("decrements from 10 to 9, enables increment and hides the limit", () => {
    render(<QuantitySelector max={10} />);

    const increaseButton = screen.getByRole("button", {
      name: "Увеличить количество",
    });

    for (let click = 0; click < 9; click += 1) {
      fireEvent.click(increaseButton);
    }

    expect(screen.getByText("10")).toBeTruthy();
    expect(increaseButton.disabled).toBe(true);
    expect(screen.getByRole("status").textContent).toBe("Максимум 10 штук");

    fireEvent.click(
      screen.getByRole("button", { name: "Уменьшить количество" }),
    );

    expect(screen.getByText("9")).toBeTruthy();
    expect(increaseButton.disabled).toBe(false);
    expect(screen.queryByText("Максимум 10 штук")).toBeNull();
  });
});
