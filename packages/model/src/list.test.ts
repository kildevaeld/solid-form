import { describe, test, expect, vi } from "vitest";
import { ObservableList } from "./list";

describe("ObservableList - Create Tests", () => {
  test("should create an empty list", () => {
    const list = new ObservableList<number>();

    expect(list.length).toBe(0);
    expect(list.toJSON()).toEqual([]);
  });

  test("should create a list with initial values", () => {
    const list = new ObservableList([1, 2, 3, 4, 5]);

    expect(list.length).toBe(5);
    expect(list.at(0)).toBe(1);
    expect(list.at(4)).toBe(5);
  });

  test("should create a list with string values", () => {
    const list = new ObservableList(["a", "b", "c"]);

    expect(list.length).toBe(3);
    expect(list.toJSON()).toEqual(["a", "b", "c"]);
  });

  test("should create a list with object values", () => {
    const items = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];
    const list = new ObservableList(items);

    expect(list.length).toBe(2);
    expect(list.at(0)).toEqual({ id: 1, name: "Alice" });
  });

  test("should create a list with mixed types", () => {
    const list = new ObservableList<any>([1, "two", true, { four: 4 }, [5]]);

    expect(list.length).toBe(5);
    expect(list.at(2)).toBe(true);
  });
});

describe("ObservableList - Push Tests", () => {
  test("should push a single item", () => {
    const list = new ObservableList<number>();

    list.push(1);

    expect(list.length).toBe(1);
    expect(list.at(0)).toBe(1);
  });

  test("should push multiple items at once", () => {
    const list = new ObservableList<string>();

    list.push("a", "b", "c");

    expect(list.length).toBe(3);
    expect(list.toJSON()).toEqual(["a", "b", "c"]);
  });

  test("should emit change event on push", () => {
    const list = new ObservableList<number>();
    const listener = vi.fn();

    list.on("change", listener);
    list.push(10, 20);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      type: "push",
      items: [10, 20],
    });
  });

  test("should push to existing list", () => {
    const list = new ObservableList([1, 2, 3]);

    list.push(4, 5);

    expect(list.length).toBe(5);
    expect(list.toJSON()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("ObservableList - Insert Tests", () => {
  test("should insert item at valid index", () => {
    const list = new ObservableList([1, 2, 3]);

    list.insert(1, 10);

    expect(list.at(1)).toBe(10);
    expect(list.length).toBe(3);
  });

  test("should emit change event on insert", () => {
    const list = new ObservableList(["a", "b", "c"]);
    const listener = vi.fn();

    list.on("change", listener);
    list.insert(0, "x");

    expect(listener).toHaveBeenCalledWith({
      type: "insert",
      item: "x",
      prev: "a",
    });
  });

  test("should throw error when inserting at invalid index", () => {
    const list = new ObservableList([1, 2, 3]);

    expect(() => list.insert(10, 99)).toThrow(RangeError);
    expect(() => list.insert(-1, 99)).toThrow(RangeError);
  });

  test("should not emit event if inserted value is same as previous", () => {
    const list = new ObservableList([1, 2, 3]);
    const listener = vi.fn();

    list.on("change", listener);
    list.insert(1, 2);

    expect(listener).not.toHaveBeenCalled();
  });
});

describe("ObservableList - Pop Tests", () => {
  test("should pop last item from list", () => {
    const list = new ObservableList([1, 2, 3]);

    const popped = list.pop();

    expect(popped).toBe(3);
    expect(list.length).toBe(2);
    expect(list.toJSON()).toEqual([1, 2]);
  });

  test("should emit change event on pop", () => {
    const list = new ObservableList(["a", "b", "c"]);
    const listener = vi.fn();

    list.on("change", listener);
    const popped = list.pop();

    expect(listener).toHaveBeenCalledWith({
      type: "pop",
      item: "c",
    });
  });

  test("should return undefined when popping from empty list", () => {
    const list = new ObservableList<number>();

    const popped = list.pop();

    expect(popped).toBeUndefined();
  });

  test("should emit event even when popping from empty list", () => {
    const list = new ObservableList<number>();
    const listener = vi.fn();

    list.on("change", listener);
    list.pop();

    expect(listener).toHaveBeenCalledWith({
      type: "pop",
      item: undefined,
    });
  });
});

describe("ObservableList - Remove Tests", () => {
  test("should remove item at valid index", () => {
    const list = new ObservableList([10, 20, 30, 40]);

    const removed = list.remove(1);

    expect(removed).toBe(20);
    expect(list.length).toBe(3);
    expect(list.toJSON()).toEqual([10, 30, 40]);
  });

  test("should emit change event on remove", () => {
    const list = new ObservableList(["a", "b", "c"]);
    const listener = vi.fn();

    list.on("change", listener);
    list.remove(1);

    expect(listener).toHaveBeenCalledWith({
      type: "remove",
      index: 1,
      item: "b",
    });
  });

  test("should throw error when removing at invalid index", () => {
    const list = new ObservableList([1, 2, 3]);

    expect(() => list.remove(10)).toThrow(RangeError);
    expect(() => list.remove(-1)).toThrow(RangeError);
  });

  test("should handle removing first item", () => {
    const list = new ObservableList([1, 2, 3]);

    const removed = list.remove(0);

    expect(removed).toBe(1);
    expect(list.toJSON()).toEqual([2, 3]);
  });

  test("should handle removing last item", () => {
    const list = new ObservableList([1, 2, 3]);

    const removed = list.remove(2);

    expect(removed).toBe(3);
    expect(list.toJSON()).toEqual([1, 2]);
  });
});

describe("ObservableList - Access Tests", () => {
  test("should access item at valid index with at()", () => {
    const list = new ObservableList(["first", "second", "third"]);

    expect(list.at(0)).toBe("first");
    expect(list.at(1)).toBe("second");
    expect(list.at(2)).toBe("third");
  });

  test("should return undefined for out of bounds index", () => {
    const list = new ObservableList([1, 2, 3]);

    expect(list.at(10)).toBeUndefined();
    expect(list.at(-1)).toBeUndefined();
  });

  test("should access length property", () => {
    const list = new ObservableList([1, 2, 3, 4, 5]);

    expect(list.length).toBe(5);
  });

  test("should update length when adding items", () => {
    const list = new ObservableList<number>();

    list.push(1);
    expect(list.length).toBe(1);

    list.push(2, 3);
    expect(list.length).toBe(3);
  });

  test("should update length when removing items", () => {
    const list = new ObservableList([1, 2, 3, 4]);

    list.pop();
    expect(list.length).toBe(3);

    list.remove(0);
    expect(list.length).toBe(2);
  });

  test("should allow setting length directly", () => {
    const list = new ObservableList([1, 2, 3, 4, 5]);

    list.length = 3;

    expect(list.length).toBe(3);
  });
});

describe("ObservableList - Map Tests", () => {
  test("should map over list items", () => {
    const list = new ObservableList([1, 2, 3, 4]);

    const mapped = list.map((x) => x * 2);

    expect(mapped.toJSON()).toEqual([2, 4, 6, 8]);
  });

  test("should map to different type", () => {
    const list = new ObservableList([1, 2, 3]);

    const mapped = list.map((x) => String(x));

    expect(mapped.toJSON()).toEqual(["1", "2", "3"]);
  });

  test("should return new ObservableList from map", () => {
    const list = new ObservableList([1, 2, 3]);

    const mapped = list.map((x) => x * 2);

    expect(mapped).toBeInstanceOf(ObservableList);
    expect(mapped).not.toBe(list);
  });
});

describe("ObservableList - Filter Tests", () => {
  test("should filter list items", () => {
    const list = new ObservableList([1, 2, 3, 4, 5, 6]);

    const filtered = list.filter((x) => x % 2 === 0);

    expect(filtered.toJSON()).toEqual([2, 4, 6]);
  });

  test("should filter with complex predicate", () => {
    const list = new ObservableList([
      { id: 1, active: true },
      { id: 2, active: false },
      { id: 3, active: true },
    ]);

    const filtered = list.filter((item) => item.active);

    expect(filtered.length).toBe(2);
    expect(filtered.at(0)?.id).toBe(1);
  });

  test("should return new ObservableList from filter", () => {
    const list = new ObservableList([1, 2, 3]);

    const filtered = list.filter((x) => x > 1);

    expect(filtered).toBeInstanceOf(ObservableList);
    expect(filtered).not.toBe(list);
  });

  test("should return empty list when no items match", () => {
    const list = new ObservableList([1, 2, 3]);

    const filtered = list.filter((x) => x > 10);

    expect(filtered.length).toBe(0);
  });
});

describe("ObservableList - Find Tests", () => {
  test("should find first matching item", () => {
    const list = new ObservableList([1, 2, 3, 4, 5]);

    const found = list.find((x) => x > 2);

    expect(found).toBe(3);
  });

  test("should return undefined if no item matches", () => {
    const list = new ObservableList([1, 2, 3]);

    const found = list.find((x) => x > 10);

    expect(found).toBeUndefined();
  });

  test("should find object by property", () => {
    const list = new ObservableList([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" },
    ]);

    const found = list.find((item) => item.name === "Bob");

    expect(found).toEqual({ id: 2, name: "Bob" });
  });
});

describe("ObservableList - Iteration Tests", () => {
  test("should support Symbol.iterator", () => {
    const list = new ObservableList([1, 2, 3]);

    const items = Array.from(list);

    expect(items).toEqual([1, 2, 3]);
  });

  test("should iterate with for...of", () => {
    const list = new ObservableList(["a", "b", "c"]);
    const collected: string[] = [];

    for (const item of list) {
      collected.push(item);
    }

    expect(collected).toEqual(["a", "b", "c"]);
  });

  test("should iterate over updated list", () => {
    const list = new ObservableList([1, 2, 3]);

    list.push(4);
    list.remove(0);

    const items = Array.from(list);
    expect(items).toEqual([2, 3, 4]);
  });
});

describe("ObservableList - Serialization Tests", () => {
  test("should convert to JSON array", () => {
    const list = new ObservableList([1, 2, 3, 4]);

    const json = list.toJSON();

    expect(json).toEqual([1, 2, 3, 4]);
  });

  test("should create independent copy with toJSON", () => {
    const list = new ObservableList([1, 2, 3]);

    const json = list.toJSON();
    list.push(4);

    expect(json).toEqual([1, 2, 3]);
    expect(list.toJSON()).toEqual([1, 2, 3, 4]);
  });

  test("should handle complex objects in toJSON", () => {
    const list = new ObservableList([
      { id: 1, data: [1, 2] },
      { id: 2, data: [3, 4] },
    ]);

    const json = list.toJSON();

    expect(json).toEqual([
      { id: 1, data: [1, 2] },
      { id: 2, data: [3, 4] },
    ]);
  });
});

describe("ObservableList - Event Handling Tests", () => {
  test("should remove listener with off", () => {
    const list = new ObservableList<number>();
    const listener = vi.fn();

    list.on("change", listener);
    list.push(1);
    expect(listener).toHaveBeenCalledTimes(1);

    list.off("change", listener);
    list.push(2);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("should return unsubscribe function from on", () => {
    const list = new ObservableList<number>();
    const listener = vi.fn();

    const unsubscribe = list.on("change", listener);

    list.push(1);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    list.push(2);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("should support multiple listeners", () => {
    const list = new ObservableList<number>();
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    list.on("change", listener1);
    list.on("change", listener2);

    list.push(1);

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  test("should emit different event types", () => {
    const list = new ObservableList([1, 2, 3]);
    const events: Array<{ type: string }> = [];

    list.on("change", (event) => {
      events.push({ type: event.type });
    });

    list.push(4);
    list.pop();
    list.insert(0, 10);
    list.remove(0);

    expect(events).toEqual([
      { type: "push" },
      { type: "pop" },
      { type: "insert" },
      { type: "remove" },
    ]);
  });
});

describe("ObservableList - Integration Tests", () => {
  test("should handle full CRUD lifecycle", () => {
    const list = new ObservableList<string>();
    const changeLog: string[] = [];

    list.on("change", (event) => {
      changeLog.push(event.type);
    });

    // Create
    list.push("item1", "item2", "item3");
    expect(list.length).toBe(3);

    // Update
    list.insert(1, "updated");
    expect(list.at(1)).toBe("updated");

    // Delete
    list.remove(0);
    expect(list.length).toBe(2);

    list.pop();
    expect(list.length).toBe(1);

    expect(changeLog).toEqual(["push", "insert", "remove", "pop"]);
  });

  test("should work with complex data structures", () => {
    type TodoItem = { id: number; text: string; completed: boolean };
    const list = new ObservableList<TodoItem>([
      { id: 1, text: "Task 1", completed: false },
      { id: 2, text: "Task 2", completed: false },
    ]);

    list.push({ id: 3, text: "Task 3", completed: false });

    const incomplete = list.filter((item) => !item.completed);
    expect(incomplete.length).toBe(3);

    const task2 = list.find((item) => item.id === 2);
    expect(task2?.text).toBe("Task 2");
  });

  test("should maintain consistency across operations", () => {
    const list = new ObservableList([10, 20, 30]);

    list.push(40);
    expect(list.length).toBe(4);

    list.remove(1);
    expect(list.length).toBe(3);
    expect(list.toJSON()).toEqual([10, 30, 40]);

    list.insert(1, 25);
    expect(list.toJSON()).toEqual([10, 25, 40]);

    const mapped = list.map((x) => x / 10);
    expect(mapped.toJSON()).toEqual([1, 2.5, 4]);
  });
});
