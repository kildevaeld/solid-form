import { describe, test, expect, vi } from "vitest";
import { Collection } from "./collection";
import { Model } from "./model";

describe("Collection - Create Tests", () => {
  test("should create an empty collection", () => {
    const collection = new Collection<Model<{ id: number; name: string }, "id">>();

    expect(collection.length).toBe(0);
  });

  test("should create a collection with initial models", () => {
    const model1 = new Model({
      primaryKey: "id",
      values: { id: 1, name: "Alice" },
    });
    const model2 = new Model({
      primaryKey: "id",
      values: { id: 2, name: "Bob" },
    });

    const collection = new Collection([model1, model2]);

    expect(collection.length).toBe(2);
    expect(collection.at(0)).toBe(model1);
    expect(collection.at(1)).toBe(model2);
  });

  test("should push new models to collection", () => {
    const collection = new Collection<Model<{ id: number; name: string }, "id">>();
    const model = new Model({
      primaryKey: "id",
      values: { id: 1, name: "New Model" },
    });

    collection.push(model);

    expect(collection.length).toBe(1);
    expect(collection.at(0)).toBe(model);
  });

  test("should push multiple models at once", () => {
    const collection = new Collection<Model<{ id: number; name: string }, "id">>();
    const model1 = new Model({
      primaryKey: "id",
      values: { id: 1, name: "First" },
    });
    const model2 = new Model({
      primaryKey: "id",
      values: { id: 2, name: "Second" },
    });

    collection.push(model1, model2);

    expect(collection.length).toBe(2);
  });

  test("should emit change event when pushing models", () => {
    const collection = new Collection<Model<{ id: number; name: string }, "id">>();
    const listener = vi.fn();
    const model = new Model({
      primaryKey: "id",
      values: { id: 1, name: "Test" },
    });

    collection.on("change", listener);
    collection.push(model);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      type: "push",
      items: [model],
    });
  });

  test("should get model by id", () => {
    const model1 = new Model({
      primaryKey: "id",
      values: { id: 1, name: "Alice" },
    });
    const model2 = new Model({
      primaryKey: "id",
      values: { id: 2, name: "Bob" },
    });

    const collection = new Collection([model1, model2]);

    expect(collection.get(1)).toBe(model1);
    expect(collection.get(2)).toBe(model2);
  });

  test("should return undefined for non-existent id", () => {
    const model = new Model({
      primaryKey: "id",
      values: { id: 1, name: "Test" },
    });
    const collection = new Collection([model]);

    expect(collection.get(999)).toBeUndefined();
  });

  test("should work with string primary keys", () => {
    const model1 = new Model({
      primaryKey: "uuid",
      values: { uuid: "abc-123", title: "First" },
    });
    const model2 = new Model({
      primaryKey: "uuid",
      values: { uuid: "def-456", title: "Second" },
    });

    const collection = new Collection([model1, model2]);

    expect(collection.get("abc-123")).toBe(model1);
    expect(collection.get("def-456")).toBe(model2);
  });
});

describe("Collection - Update Tests", () => {
  test("should update model in collection and reflect changes", () => {
    const model = new Model({
      primaryKey: "id",
      values: { id: 1, name: "Original", status: "draft" },
    });
    const collection = new Collection([model]);

    // Update the model
    model.set("name", "Updated");
    model.set("status", "published");

    // Verify the collection reflects the changes
    const retrieved = collection.get(1);
    expect(retrieved?.get("name")).toBe("Updated");
    expect(retrieved?.get("status")).toBe("published");
  });

  test("should update model at specific index", () => {
    const model1 = new Model({
      primaryKey: "id",
      values: { id: 1, count: 0 },
    });
    const model2 = new Model({
      primaryKey: "id",
      values: { id: 2, count: 10 },
    });
    const collection = new Collection([model1, model2]);

    // Update model at index
    const modelAtIndex = collection.at(1);
    modelAtIndex?.set("count", 20);

    expect(collection.at(1)?.get("count")).toBe(20);
  });

  test("should insert model at index and emit change event", () => {
    const model1 = new Model({
      primaryKey: "id",
      values: { id: 1, name: "First" },
    });
    const model2 = new Model({
      primaryKey: "id",
      values: { id: 2, name: "Second" },
    });
    const collection = new Collection([model1, model2]);
    const listener = vi.fn();

    collection.on("change", listener);

    const newModel = new Model({
      primaryKey: "id",
      values: { id: 3, name: "Replacement" },
    });

    collection.insert(0, newModel);

    expect(listener).toHaveBeenCalledWith({
      type: "insert",
      item: newModel,
      prev: model1,
    });
    expect(collection.at(0)).toBe(newModel);
  });

  test("should remove model from collection", () => {
    const model1 = new Model({
      primaryKey: "id",
      values: { id: 1, name: "Alice" },
    });
    const model2 = new Model({
      primaryKey: "id",
      values: { id: 2, name: "Bob" },
    });
    const collection = new Collection([model1, model2]);

    const removed = collection.remove(0);

    expect(removed).toBe(model1);
    expect(collection.length).toBe(1);
    expect(collection.at(0)).toBe(model2);
  });

  test("should emit change event when removing model", () => {
    const model = new Model({
      primaryKey: "id",
      values: { id: 1, name: "Test" },
    });
    const collection = new Collection([model]);
    const listener = vi.fn();

    collection.on("change", listener);
    collection.remove(0);

    expect(listener).toHaveBeenCalledWith({
      type: "remove",
      index: 0,
      item: model,
    });
  });

  test("should handle model updates via events", () => {
    const model = new Model({
      primaryKey: "id",
      values: { id: 1, value: 0 },
    });
    const collection = new Collection([model]);
    const changeListener = vi.fn();

    // Listen to model changes
    model.on("change", changeListener);

    model.set("value", 100);

    expect(changeListener).toHaveBeenCalledWith({
      key: "value",
      value: 100,
      prev: 0,
    });

    // Verify collection has updated model
    expect(collection.get(1)?.get("value")).toBe(100);
  });
});

describe("Collection - Integration Tests", () => {
  test("should support full create-update-delete lifecycle", () => {
    const collection = new Collection<Model<{ id: number; name: string; active: boolean }, "id">>();

    // Create - add new models
    const model1 = new Model({
      primaryKey: "id",
      values: { id: 1, name: "Product A", active: false },
    });
    const model2 = new Model({
      primaryKey: "id",
      values: { id: 2, name: "Product B", active: false },
    });

    collection.push(model1, model2);
    expect(collection.length).toBe(2);

    // Update - modify existing models
    model1.set("name", "Updated Product A");
    model1.set("active", true);

    expect(collection.get(1)?.get("name")).toBe("Updated Product A");
    expect(collection.get(1)?.get("active")).toBe(true);

    // Delete - remove a model
    collection.remove(1);
    expect(collection.length).toBe(1);
    expect(collection.get(2)).toBeUndefined();
  });

  test("should filter models in collection", () => {
    const model1 = new Model({
      primaryKey: "id",
      values: { id: 1, active: true },
    });
    const model2 = new Model({
      primaryKey: "id",
      values: { id: 2, active: false },
    });
    const model3 = new Model({
      primaryKey: "id",
      values: { id: 3, active: true },
    });

    const collection = new Collection([model1, model2, model3]);
    const activeModels = collection.filter((m) => m.get("active") === true);

    expect(activeModels.length).toBe(2);
  });

  test("should map over collection models", () => {
    const model1 = new Model({
      primaryKey: "id",
      values: { id: 1, name: "A" },
    });
    const model2 = new Model({
      primaryKey: "id",
      values: { id: 2, name: "B" },
    });

    const collection = new Collection([model1, model2]);
    const names = collection.map((m) => m.get("name"));

    expect(names.toJSON()).toEqual(["A", "B"]);
  });

  test("should convert collection to JSON", () => {
    const model1 = new Model({
      primaryKey: "id",
      values: { id: 1, name: "First" },
    });
    const model2 = new Model({
      primaryKey: "id",
      values: { id: 2, name: "Second" },
    });

    const collection = new Collection([model1, model2]);
    const json = collection.toJSON();

    expect(json).toEqual([model1, model2]);
  });

  test("should support iteration over collection", () => {
    const model1 = new Model({
      primaryKey: "id",
      values: { id: 1, value: "a" },
    });
    const model2 = new Model({
      primaryKey: "id",
      values: { id: 2, value: "b" },
    });

    const collection = new Collection([model1, model2]);
    const models = Array.from(collection);

    expect(models).toEqual([model1, model2]);
  });

  test("should unsubscribe from collection events", () => {
    const collection = new Collection<Model<{ id: number }, "id">>();
    const listener = vi.fn();

    const unsubscribe = collection.on("change", listener);

    const model = new Model({
      primaryKey: "id",
      values: { id: 1 },
    });
    collection.push(model);

    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    collection.pop();

    expect(listener).toHaveBeenCalledTimes(1); // Should not be called again
  });
});
