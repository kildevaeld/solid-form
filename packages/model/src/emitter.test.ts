import { describe, test, expect, vi } from "vitest";
import { EventEmitter } from "./emitter";

type TestEvents = {
  ping: { value: number };
  message: { text: string };
};

describe("EventEmitter", () => {
  test("should register and emit events", () => {
    const emitter = new EventEmitter<TestEvents>();
    const listener = vi.fn();

    emitter.on("ping", listener);
    emitter.emit("ping", { value: 42 });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ value: 42 });
  });

  test("should support multiple listeners for same event", () => {
    const emitter = new EventEmitter<TestEvents>();
    const l1 = vi.fn();
    const l2 = vi.fn();

    emitter.on("message", l1);
    emitter.on("message", l2);
    emitter.emit("message", { text: "hello" });

    expect(l1).toHaveBeenCalledWith({ text: "hello" });
    expect(l2).toHaveBeenCalledWith({ text: "hello" });
  });

  test("should remove listener with off", () => {
    const emitter = new EventEmitter<TestEvents>();
    const listener = vi.fn();

    emitter.on("ping", listener);
    emitter.off("ping", listener);
    emitter.emit("ping", { value: 1 });

    expect(listener).not.toHaveBeenCalled();
  });

  test("should return subscription that removes listener", () => {
    const emitter = new EventEmitter<TestEvents>();
    const listener = vi.fn();

    const unsubscribe = emitter.on("ping", listener);
    unsubscribe();
    emitter.emit("ping", { value: 2 });

    expect(listener).not.toHaveBeenCalled();
  });

  test("off should be safe for unknown events", () => {
    const emitter = new EventEmitter<TestEvents>();
    const listener = vi.fn();

    expect(() => emitter.off("ping", listener)).not.toThrow();
  });

  test("emit should be safe for unknown events", () => {
    const emitter = new EventEmitter<TestEvents>();

    expect(() => emitter.emit("ping", { value: 0 })).not.toThrow();
  });
});
