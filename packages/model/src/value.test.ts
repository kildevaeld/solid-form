import { describe, test, expect, vi } from "vitest";
import { Value } from "./value";
import { REACTIVE } from "./base";

describe("Value", () => {
  test("should initialize with provided value", () => {
    const value = new Value(42);
    expect(value.get()).toBe(42);
  });

  test("content getter should return current value", () => {
    const value = new Value("hello");
    expect(value.content).toBe("hello");
  });

  test("content setter should update value", () => {
    const value = new Value<string>();
    value.content = "updated";
    expect(value.get()).toBe("updated");
  });

  test("set should update value", () => {
    const value = new Value<number>();
    value.set(10);
    expect(value.get()).toBe(10);
  });

  test("should emit change event when value changes", () => {
    const value = new Value<number>(1);
    const listener = vi.fn();

    value.on("change", listener);
    value.set(2);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ prev: 1, value: 2 });
  });

  test("should not emit change event when value is equal", () => {
    const value = new Value<number>(1);
    const listener = vi.fn();

    value.on("change", listener);
    value.set(1);

    expect(listener).not.toHaveBeenCalled();
  });

  test("should use custom equality", () => {
    const alwaysEqual = () => true;
    const value = new Value<number>(1, alwaysEqual);
    const listener = vi.fn();

    value.on("change", listener);
    value.set(2);

    expect(listener).not.toHaveBeenCalled();
  });

  test("off should remove listener", () => {
    const value = new Value<number>(1);
    const listener = vi.fn();

    value.on("change", listener);
    value.off("change", listener);
    value.set(2);

    expect(listener).not.toHaveBeenCalled();
  });

  test("subscribe should return unsubscribe function", () => {
    const value = new Value<number>(1);
    const listener = vi.fn();

    const unsubscribe = value.subscribe(listener);
    unsubscribe();
    value.set(2);

    expect(listener).not.toHaveBeenCalled();
  });

  test("should expose reactive flag", () => {
    const value = new Value<number>(1);
    expect((value as any)[REACTIVE]).toBe(true);
  });
});
