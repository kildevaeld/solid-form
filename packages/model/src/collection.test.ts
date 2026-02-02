import { describe, test, expect, vi } from "vitest";
import { Collection } from "./collection";

describe("Collection", () => {
  test("should initialize with empty array by default", () => {
    const collection = new Collection<number>();
    expect(collection.length).toBe(0);
  });

  test("should initialize with provided values", () => {
    const collection = new Collection([1, 2, 3]);
    expect(collection.length).toBe(3);
    expect(collection.at(0)).toBe(1);
  });

  test("should get and set length", () => {
    const collection = new Collection([1, 2, 3]);
    collection.length = 2;
    expect(collection.length).toBe(2);
    expect(collection.at(2)).toBeUndefined();
  });

  test("insert should replace value and emit change", () => {
    const collection = new Collection([1, 2, 3]);
    const listener = vi.fn();

    collection.on("change", listener);
    collection.insert(1, 5);

    expect(collection.at(1)).toBe(5);
    expect(listener).toHaveBeenCalledWith({
      type: "insert",
      item: 5,
      prev: 2,
    });
  });

  test("insert should not emit change when value is same", () => {
    const collection = new Collection([1, 2, 3]);
    const listener = vi.fn();

    collection.on("change", listener);
    collection.insert(1, 2);

    expect(listener).not.toHaveBeenCalled();
  });

  test("insert should throw RangeError for invalid index", () => {
    const collection = new Collection([1, 2, 3]);
    expect(() => collection.insert(5, 10)).toThrow(RangeError);
    expect(() => collection.insert(-1, 10)).toThrow(RangeError);
  });

  test("push should add items and emit change", () => {
    const collection = new Collection([1]);
    const listener = vi.fn();

    collection.on("change", listener);
    collection.push(2, 3);

    expect(collection.length).toBe(3);
    expect(listener).toHaveBeenCalledWith({ type: "push", items: [2, 3] });
  });

  test("pop should remove last item and emit change", () => {
    const collection = new Collection([1, 2]);
    const listener = vi.fn();

    collection.on("change", listener);
    const value = collection.pop();

    expect(value).toBe(2);
    expect(collection.length).toBe(1);
    expect(listener).toHaveBeenCalledWith({ type: "pop", item: 2 });
  });

  test("pop should emit undefined when empty", () => {
    const collection = new Collection<number>();
    const listener = vi.fn();

    collection.on("change", listener);
    const value = collection.pop();

    expect(value).toBeUndefined();
    expect(listener).toHaveBeenCalledWith({ type: "pop", item: undefined });
  });

  test("at should return value at index", () => {
    const collection = new Collection([1, 2, 3]);
    expect(collection.at(1)).toBe(2);
  });

  test("map should return new Collection with mapped values", () => {
    const collection = new Collection([1, 2, 3]);
    const mapped = collection.map((x) => x * 2);

    expect(mapped).toBeInstanceOf(Collection);
    expect(mapped.at(0)).toBe(2);
    expect(mapped.at(2)).toBe(6);
  });

  test("filter should return new Collection with filtered values", () => {
    const collection = new Collection([1, 2, 3, 4]);
    const filtered = collection.filter((x) => x % 2 === 0);

    expect(filtered.at(0)).toBe(2);
    expect(filtered.at(1)).toBe(4);
    expect(filtered.length).toBe(2);
  });

  test("find should return matching value", () => {
    const collection = new Collection([1, 2, 3]);
    const found = collection.find((x) => x > 2);

    expect(found).toBe(3);
  });

  test("find should return undefined when not found", () => {
    const collection = new Collection([1, 2, 3]);
    const found = collection.find((x) => x > 5);

    expect(found).toBeUndefined();
  });

  test("should be iterable", () => {
    const collection = new Collection([1, 2, 3]);
    const values = Array.from(collection);

    expect(values).toEqual([1, 2, 3]);
  });
});
