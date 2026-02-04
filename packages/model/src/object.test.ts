import { describe, test, expect, vi } from "vitest";
import { ObservableObject } from "./object";
import { REACTIVE } from "./base";

describe("ObservableObject - Create Tests", () => {
  test("should create observable object with initial values", () => {
    const obj = new ObservableObject({ name: "John", age: 30, active: true });

    expect(obj.get("name")).toBe("John");
    expect(obj.get("age")).toBe(30);
    expect(obj.get("active")).toBe(true);
  });

  test("should create observable object with empty values", () => {
    const obj = new ObservableObject({});

    expect(obj.toJSON()).toEqual({});
  });

  test("should create observable object with nested objects", () => {
    const obj = new ObservableObject({
      user: { name: "Alice", id: 1 },
      settings: { theme: "dark" },
    });

    expect(obj.get("user")).toEqual({ name: "Alice", id: 1 });
    expect(obj.get("settings")).toEqual({ theme: "dark" });
  });

  test("should create observable object with array values", () => {
    const obj = new ObservableObject({
      tags: ["tag1", "tag2"],
      scores: [1, 2, 3],
    });

    expect(obj.get("tags")).toEqual(["tag1", "tag2"]);
    expect(obj.get("scores")).toEqual([1, 2, 3]);
  });

  test("should create observable object with custom equality", () => {
    const alwaysEqual = () => true;
    const obj = new ObservableObject({ value: 1 }, alwaysEqual);

    expect(obj.get("value")).toBe(1);
  });

  test("should expose reactive flag", () => {
    const obj = new ObservableObject({ test: true });

    expect((obj as any)[REACTIVE]).toBe(true);
  });
});

describe("ObservableObject - Update Tests", () => {
  test("should update a single property", () => {
    const obj = new ObservableObject({ count: 0, label: "initial" });

    obj.set("count", 5);
    expect(obj.get("count")).toBe(5);
  });

  test("should update multiple properties independently", () => {
    const obj = new ObservableObject({
      firstName: "John",
      lastName: "Doe",
      age: 25,
    });

    obj.set("firstName", "Jane");
    obj.set("age", 30);

    expect(obj.get("firstName")).toBe("Jane");
    expect(obj.get("lastName")).toBe("Doe");
    expect(obj.get("age")).toBe(30);
  });

  test("should update property to undefined", () => {
    const obj = new ObservableObject<{ optional?: string }>({
      optional: "value",
    });

    obj.set("optional", undefined);
    expect(obj.get("optional")).toBeUndefined();
  });

  test("should emit general change event on update", () => {
    const obj = new ObservableObject({ status: "pending" });
    const listener = vi.fn();

    obj.on("change", listener);
    obj.set("status", "completed");

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      key: "status",
      value: "completed",
      prev: "pending",
    });
  });

  test("should emit field-specific change event on update", () => {
    const obj = new ObservableObject({ counter: 0 });
    const listener = vi.fn();

    obj.on("change:counter", listener);
    obj.set("counter", 10);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      value: 10,
      prev: 0,
    });
  });

  test("should not emit change event when value is equal", () => {
    const obj = new ObservableObject({ value: 42 });
    const listener = vi.fn();

    obj.on("change", listener);
    obj.set("value", 42);

    expect(listener).not.toHaveBeenCalled();
  });

  test("should use custom equality for change detection", () => {
    const alwaysEqual = () => true;
    const obj = new ObservableObject({ num: 1 }, alwaysEqual);
    const listener = vi.fn();

    obj.on("change", listener);
    obj.set("num", 100);

    expect(listener).not.toHaveBeenCalled();
  });

  test("should handle multiple listeners for same field", () => {
    const obj = new ObservableObject({ price: 100 });
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    obj.on("change:price", listener1);
    obj.on("change:price", listener2);

    obj.set("price", 200);

    expect(listener1).toHaveBeenCalledWith({ value: 200, prev: 100 });
    expect(listener2).toHaveBeenCalledWith({ value: 200, prev: 100 });
  });

  test("should handle multiple listeners for general change event", () => {
    const obj = new ObservableObject({ value: 0 });
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    obj.on("change", listener1);
    obj.on("change", listener2);

    obj.set("value", 1);

    expect(listener1).toHaveBeenCalledWith({
      key: "value",
      value: 1,
      prev: 0,
    });
    expect(listener2).toHaveBeenCalledWith({
      key: "value",
      value: 1,
      prev: 0,
    });
  });
});

describe("ObservableObject - Iteration Tests", () => {
  test("should iterate over entries", () => {
    const obj = new ObservableObject({ a: 1, b: 2, c: 3 });
    const entries = Array.from(obj.entries());

    expect(entries).toEqual([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ]);
  });

  test("should iterate over values", () => {
    const obj = new ObservableObject({ x: 10, y: 20, z: 30 });
    const values = Array.from(obj.values());

    expect(values).toEqual([10, 20, 30]);
  });

  test("should iterate over keys", () => {
    const obj = new ObservableObject({ first: 1, second: 2, third: 3 });
    const keys = Array.from(obj.keys());

    expect(keys).toEqual(["first", "second", "third"]);
  });

  test("should support Symbol.iterator", () => {
    const obj = new ObservableObject({ a: "alpha", b: "beta" });
    const items = Array.from(obj);

    expect(items).toEqual([
      ["a", "alpha"],
      ["b", "beta"],
    ]);
  });

  test("should iterate correctly after updates", () => {
    const obj = new ObservableObject({ count: 0, label: "test" });

    obj.set("count", 5);
    obj.set("label", "updated");

    const entries = Array.from(obj.entries());
    expect(entries).toEqual([
      ["count", 5],
      ["label", "updated"],
    ]);
  });
});

describe("ObservableObject - Serialization Tests", () => {
  test("should convert to JSON", () => {
    const obj = new ObservableObject({ id: 1, name: "Test", active: true });
    const json = obj.toJSON();

    expect(json).toEqual({ id: 1, name: "Test", active: true });
  });

  test("should create independent copy with toJSON", () => {
    const obj = new ObservableObject({ value: 10 });
    const json = obj.toJSON();

    obj.set("value", 20);

    expect(json.value).toBe(10); // Original copy should not change
    expect(obj.get("value")).toBe(20);
  });

  test("should handle nested objects in toJSON", () => {
    const obj = new ObservableObject({
      user: { name: "Alice", age: 30 },
      settings: { theme: "dark" },
    });

    const json = obj.toJSON();
    expect(json).toEqual({
      user: { name: "Alice", age: 30 },
      settings: { theme: "dark" },
    });
  });
});

describe("ObservableObject - Event Handling Tests", () => {
  test("should remove listener with off", () => {
    const obj = new ObservableObject({ value: 0 });
    const listener = vi.fn();

    obj.on("change", listener);
    obj.set("value", 1);
    expect(listener).toHaveBeenCalledTimes(1);

    obj.off("change", listener);
    obj.set("value", 2);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("should return unsubscribe function from on", () => {
    const obj = new ObservableObject({ counter: 0 });
    const listener = vi.fn();

    const unsubscribe = obj.on("change", listener);

    obj.set("counter", 1);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    obj.set("counter", 2);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("should support subscribe method", () => {
    const obj = new ObservableObject({ value: 0 });
    const observer = vi.fn();

    const unsubscribe = obj.subscribe(observer);

    obj.set("value", 10);
    expect(observer).toHaveBeenCalled();

    unsubscribe();
    obj.set("value", 20);
    expect(observer).toHaveBeenCalledTimes(1);
  });

  test("should handle multiple field-specific listeners", () => {
    const obj = new ObservableObject({ a: 1, b: 2 });
    const listenerA = vi.fn();
    const listenerB = vi.fn();

    obj.on("change:a", listenerA);
    obj.on("change:b", listenerB);

    obj.set("a", 10);
    expect(listenerA).toHaveBeenCalledTimes(1);
    expect(listenerB).not.toHaveBeenCalled();

    obj.set("b", 20);
    expect(listenerA).toHaveBeenCalledTimes(1);
    expect(listenerB).toHaveBeenCalledTimes(1);
  });
});

describe("ObservableObject - Integration Tests", () => {
  test("should support full lifecycle with events", () => {
    const obj = new ObservableObject({
      status: "draft",
      version: 1,
      content: "",
    });

    const changeLog: Array<{ key: string; value: any }> = [];
    obj.on("change", (event) => {
      changeLog.push({ key: String(event.key), value: event.value });
    });

    obj.set("status", "review");
    obj.set("content", "Some content");
    obj.set("version", 2);

    expect(changeLog).toEqual([
      { key: "status", value: "review" },
      { key: "content", value: "Some content" },
      { key: "version", value: 2 },
    ]);
  });

  test("should handle complex object updates", () => {
    const obj = new ObservableObject<{
      user: { name: string; email: string };
      metadata: { created: number; updated: number };
    }>({
      user: { name: "John", email: "john@example.com" },
      metadata: { created: 1000, updated: 1000 },
    });

    obj.set("user", { name: "Jane", email: "jane@example.com" });
    obj.set("metadata", { created: 1000, updated: 2000 });

    expect(obj.get("user")).toEqual({
      name: "Jane",
      email: "jane@example.com",
    });
    expect(obj.get("metadata").updated).toBe(2000);
  });

  test("should track changes to different data types", () => {
    const obj = new ObservableObject({
      string: "text",
      number: 42,
      boolean: true,
      array: [1, 2, 3],
      object: { key: "value" },
      null: null,
      undefined: undefined,
    });

    obj.set("string", "updated");
    obj.set("number", 100);
    obj.set("boolean", false);

    expect(obj.get("string")).toBe("updated");
    expect(obj.get("number")).toBe(100);
    expect(obj.get("boolean")).toBe(false);
  });
});
