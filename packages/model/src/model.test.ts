import { describe, test, expect, vi } from "vitest";
import { Model } from "./model";
import { REACTIVE } from "./base";

describe("Model - Create Tests", () => {
  test("should create a model with primary key and initial values", () => {
    const model = new Model({
      primaryKey: "id",
      values: { id: 1, name: "John", email: "john@example.com" },
    });

    expect(model.get("id")).toBe(1);
    expect(model.get("name")).toBe("John");
    expect(model.get("email")).toBe("john@example.com");
  });

  test("should expose id property based on primary key", () => {
    const model = new Model({
      primaryKey: "userId",
      values: { userId: 42, username: "alice" },
    });

    expect(model.id).toBe(42);
  });

  test("should handle undefined id when primary key is not set", () => {
    const model = new Model({
      primaryKey: "id",
      values: { name: "Bob" } as { id?: number; name: string },
    });

    expect(model.id).toBeUndefined();
  });

  test("should create model with string primary key", () => {
    const model = new Model({
      primaryKey: "uuid",
      values: { uuid: "abc-123", title: "Test" },
    });

    expect(model.id).toBe("abc-123");
  });

  test("should create model with custom equality function", () => {
    const alwaysEqual = () => true;
    const model = new Model(
      {
        primaryKey: "id",
        values: { id: 1, count: 0 },
      },
      alwaysEqual,
    );

    expect(model.get("count")).toBe(0);
  });

  test("should expose reactive flag", () => {
    const model = new Model({
      primaryKey: "id",
      values: { id: 1 },
    });

    expect((model as any)[REACTIVE]).toBe(true);
  });
});

describe("Model - Update Tests", () => {
  test("should update a single field", () => {
    const model = new Model({
      primaryKey: "id",
      values: { id: 1, name: "John", age: 30 },
    });

    model.set("name", "Jane");
    expect(model.get("name")).toBe("Jane");
  });

  test("should update multiple fields independently", () => {
    const model = new Model({
      primaryKey: "id",
      values: { id: 1, name: "Alice", email: "alice@test.com", age: 25 },
    });

    model.set("name", "Alice Smith");
    model.set("age", 26);

    expect(model.get("name")).toBe("Alice Smith");
    expect(model.get("age")).toBe(26);
  });

  test("should update primary key field", () => {
    const model = new Model({
      primaryKey: "id",
      values: { id: 1, name: "Test" },
    });

    model.set("id", 2);
    expect(model.id).toBe(2);
    expect(model.get("id")).toBe(2);
  });

  test("should emit change event on update", () => {
    const model = new Model({
      primaryKey: "id",
      values: { id: 1, status: "pending" },
    });

    const listener = vi.fn();
    model.on("change", listener);

    model.set("status", "completed");

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      key: "status",
      value: "completed",
      prev: "pending",
    });
  });

  test("should emit field-specific change event on update", () => {
    const model = new Model({
      primaryKey: "id",
      values: { id: 1, count: 0 },
    });

    const listener = vi.fn();
    model.on("change:count", listener);

    model.set("count", 5);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      value: 5,
      prev: 0,
    });
  });

  test("should not emit change event when value is equal", () => {
    const model = new Model({
      primaryKey: "id",
      values: { id: 1, value: 10 },
    });

    const listener = vi.fn();
    model.on("change", listener);

    model.set("value", 10);

    expect(listener).not.toHaveBeenCalled();
  });

  test("should handle updating to undefined", () => {
    const model = new Model({
      primaryKey: "id",
      values: { id: 1, optionalField: "value" } as {
        id: number;
        optionalField?: string;
      },
    });

    model.set("optionalField", undefined);
    expect(model.get("optionalField")).toBeUndefined();
  });

  test("should use custom equality for updates", () => {
    const alwaysEqual = () => true;
    const model = new Model(
      {
        primaryKey: "id",
        values: { id: 1, counter: 0 },
      },
      alwaysEqual,
    );

    const listener = vi.fn();
    model.on("change", listener);

    model.set("counter", 10);

    // Should not emit because custom equality returns true
    expect(listener).not.toHaveBeenCalled();
  });

  test("should handle multiple listeners for the same field", () => {
    const model = new Model({
      primaryKey: "id",
      values: { id: 1, price: 100 },
    });

    const listener1 = vi.fn();
    const listener2 = vi.fn();

    model.on("change:price", listener1);
    model.on("change:price", listener2);

    model.set("price", 150);

    expect(listener1).toHaveBeenCalledWith({ value: 150, prev: 100 });
    expect(listener2).toHaveBeenCalledWith({ value: 150, prev: 100 });
  });
});

describe("Model - Integration Tests", () => {
  test("should support create-update lifecycle", () => {
    // Create
    const user = new Model({
      primaryKey: "id",
      values: { id: 1, username: "newuser", status: "draft" },
    });

    expect(user.id).toBe(1);
    expect(user.get("status")).toBe("draft");

    // Update
    user.set("status", "active");
    user.set("username", "activeuser");

    expect(user.get("status")).toBe("active");
    expect(user.get("username")).toBe("activeuser");
  });

  test("should handle toJSON correctly", () => {
    const model = new Model({
      primaryKey: "id",
      values: { id: 1, name: "Test", active: true },
    });

    const json = model.toJSON();

    expect(json).toEqual({ id: 1, name: "Test", active: true });
  });

  test("should support iteration over model properties", () => {
    const model = new Model({
      primaryKey: "id",
      values: { id: 1, a: "value1", b: "value2" },
    });

    const entries = Array.from(model.entries());
    expect(entries.length).toBe(3);
  });

  test("should unsubscribe from change events", () => {
    const model = new Model({
      primaryKey: "id",
      values: { id: 1, value: 0 },
    });

    const listener = vi.fn();
    const unsubscribe = model.on("change", listener);

    model.set("value", 1);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    model.set("value", 2);
    expect(listener).toHaveBeenCalledTimes(1); // Should not be called again
  });
});
