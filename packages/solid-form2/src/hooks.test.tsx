import { describe, test, expect, vi } from "vitest";
import { createRoot, createEffect } from "solid-js";
import { useEvent } from "./hooks";
import { EventEmitter } from "@kildevaeld/model";

interface TestEvents {
  change: { value: string };
  save: { id: number };
  delete: void;
}

describe("useEvent", () => {
  test("should subscribe to event on creation", () => {
    createRoot((dispose) => {
      const emitter = new EventEmitter<TestEvents>();
      const handler = vi.fn();

      // useEvent must be called inside createEffect since it uses onCleanup
      createEffect(() => {
        useEvent(emitter, "change", handler);
      });

      // Emit event
      emitter.emit("change", { value: "test" });

      expect(handler).toHaveBeenCalledWith({ value: "test" });
      expect(handler).toHaveBeenCalledTimes(1);

      dispose();
    });
  });

  test("should handle multiple event emissions", () => {
    createRoot((dispose) => {
      const emitter = new EventEmitter<TestEvents>();
      const handler = vi.fn();

      createEffect(() => {
        useEvent(emitter, "change", handler);
      });

      // Emit multiple events
      emitter.emit("change", { value: "first" });
      emitter.emit("change", { value: "second" });
      emitter.emit("change", { value: "third" });

      expect(handler).toHaveBeenCalledTimes(3);
      expect(handler).toHaveBeenNthCalledWith(1, { value: "first" });
      expect(handler).toHaveBeenNthCalledWith(2, { value: "second" });
      expect(handler).toHaveBeenNthCalledWith(3, { value: "third" });

      dispose();
    });
  });

  test("should unsubscribe on dispose", () => {
    createRoot((dispose) => {
      const emitter = new EventEmitter<TestEvents>();
      const handler = vi.fn();

      createEffect(() => {
        useEvent(emitter, "change", handler);
      });

      // Emit event before dispose
      emitter.emit("change", { value: "before" });
      expect(handler).toHaveBeenCalledTimes(1);

      // Dispose
      dispose();

      // Emit event after dispose
      emitter.emit("change", { value: "after" });

      // Handler should not be called again
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  test("should work with different event types", () => {
    createRoot((dispose) => {
      const emitter = new EventEmitter<TestEvents>();
      const changeHandler = vi.fn();
      const saveHandler = vi.fn();
      const deleteHandler = vi.fn();

      createEffect(() => {
        useEvent(emitter, "change", changeHandler);
        useEvent(emitter, "save", saveHandler);
        useEvent(emitter, "delete", deleteHandler);
      });

      emitter.emit("change", { value: "test" });
      emitter.emit("save", { id: 123 });
      emitter.emit("delete", undefined);

      expect(changeHandler).toHaveBeenCalledWith({ value: "test" });
      expect(saveHandler).toHaveBeenCalledWith({ id: 123 });
      expect(deleteHandler).toHaveBeenCalledWith(undefined);

      dispose();
    });
  });

  test("should handle void event payloads", () => {
    createRoot((dispose) => {
      const emitter = new EventEmitter<TestEvents>();
      const handler = vi.fn();

      createEffect(() => {
        useEvent(emitter, "delete", handler);
      });

      emitter.emit("delete", undefined);

      expect(handler).toHaveBeenCalledWith(undefined);

      dispose();
    });
  });

  test("should allow multiple handlers for same event", () => {
    createRoot((dispose) => {
      const emitter = new EventEmitter<TestEvents>();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      createEffect(() => {
        useEvent(emitter, "change", handler1);
        useEvent(emitter, "change", handler2);
      });

      emitter.emit("change", { value: "test" });

      expect(handler1).toHaveBeenCalledWith({ value: "test" });
      expect(handler2).toHaveBeenCalledWith({ value: "test" });

      dispose();
    });
  });

  test("should cleanup properly even if emitter continues to exist", () => {
    const emitter = new EventEmitter<TestEvents>();
    const handler = vi.fn();

    createRoot((dispose) => {
      createEffect(() => {
        useEvent(emitter, "change", handler);
      });

      emitter.emit("change", { value: "inside" });
      expect(handler).toHaveBeenCalledTimes(1);

      dispose();
    });

    // After disposal, emitter should not trigger handler
    emitter.emit("change", { value: "outside" });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
