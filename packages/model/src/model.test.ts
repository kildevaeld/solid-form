import { describe, test, expect, vi } from "vitest";
import { Model } from "./model";
import { REACTIVE } from "./base";

type TestModel = {
  name: string;
  age: number;
  active: boolean;
};

describe("Model", () => {
  test("should initialize with provided values", () => {
    const model = new Model<TestModel>({ name: "Ada", age: 32 });
    expect(model.get("name")).toBe("Ada");
    expect(model.get("age")).toBe(32);
  });

  test("get should return undefined for missing fields", () => {
    const model = new Model<TestModel>({ name: "Ada" });
    expect(model.get("age")).toBeUndefined();
  });

  test("set should update value and emit field change event", () => {
    const model = new Model<TestModel>({ name: "Ada" });
    const listener = vi.fn();

    model.on("change:name", listener);
    model.set("name", "Grace");

    expect(model.get("name")).toBe("Grace");
    expect(listener).toHaveBeenCalledWith({ prev: "Ada", value: "Grace" });
  });

  test("set should emit general change event", () => {
    const model = new Model<TestModel>({ name: "Ada" });
    const listener = vi.fn();

    model.on("change", listener);
    model.set("name", "Grace");

    expect(listener).toHaveBeenCalledWith({
      key: "name",
      prev: "Ada",
      value: "Grace",
    });
  });

  test("set should not emit when value is equal", () => {
    const model = new Model<TestModel>({ name: "Ada" });
    const listener = vi.fn();

    model.on("change:name", listener);
    model.set("name", "Ada");

    expect(listener).not.toHaveBeenCalled();
  });

  test("should use custom equality", () => {
    const equal = () => true;
    const model = new Model<TestModel>({ name: "Ada" }, equal);
    const listener = vi.fn();

    model.on("change:name", listener);
    model.set("name", "Grace");

    expect(listener).not.toHaveBeenCalled();
  });

  test("off should remove listeners", () => {
    const model = new Model<TestModel>({ name: "Ada" });
    const listener = vi.fn();

    model.on("change:name", listener);
    model.off("change:name", listener);
    model.set("name", "Grace");

    expect(listener).not.toHaveBeenCalled();
  });

  test("should be iterable over entries", () => {
    const model = new Model<TestModel>({ name: "Ada", age: 32 });
    const entries = Array.from(model);

    expect(entries).toEqual([
      ["name", "Ada"],
      ["age", 32],
    ]);
  });

  test("entries should return key/value pairs", () => {
    const model = new Model<TestModel>({ name: "Ada", active: true });
    expect(model.entries()).toEqual([
      ["name", "Ada"],
      ["active", true],
    ]);
  });

  test("values should return values array", () => {
    const model = new Model<TestModel>({ name: "Ada", age: 32 });
    expect(model.values()).toEqual(["Ada", 32]);
  });

  test("keys should return keys array", () => {
    const model = new Model<TestModel>({ name: "Ada", age: 32 });
    expect(model.keys()).toEqual(["name", "age"]);
  });

  test("subscribe should receive change notifications", () => {
    const model = new Model<TestModel>({ name: "Ada" });
    const observer = vi.fn();

    const unsubscribe = model.subscribe(observer);
    model.set("name", "Grace");

    expect(observer).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  test("should expose reactive flag", () => {
    const model = new Model<TestModel>({ name: "Ada" });
    expect((model as any)[REACTIVE]).toBe(true);
  });
});
