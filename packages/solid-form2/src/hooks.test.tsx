import { describe, test, expect, vi } from "vitest";
import { createRoot, createEffect } from "solid-js";
import { useEvent } from "./hooks.js";
import { EventEmitter } from "@kildevaeld/model";

interface TestEvents {
  change: { value: string };
  save: { id: number };
  delete: void;
}

describe("useEvent", () => {
  test("should subscribe to event on creation", async () => {
    await new Promise<void>((resolve) => {
      const emitter = new EventEmitter<TestEvents>();
      const handler = vi.fn() as (
        payload: TestEvents[keyof TestEvents],
      ) => void;

      createRoot((dispose) => {
        // useEvent must be called inside createEffect since it uses onCleanup
        createEffect(() => {
          useEvent<TestEvents>(emitter, "change", handler);
        });

        // Give effect time to run
        setTimeout(() => {
          // Emit event
          emitter.emit("change", { value: "test" });

          expect(handler).toHaveBeenCalledWith({ value: "test" });
          expect(handler).toHaveBeenCalledTimes(1);

          dispose();
          resolve();
        }, 50);
      });
    });
  });

  test("should handle multiple event emissions", async () => {
    await new Promise<void>((resolve) => {
      const emitter = new EventEmitter<TestEvents>();
      const handler = vi.fn();

      createRoot((dispose) => {
        createEffect(() => {
          useEvent<TestEvents>(emitter, "change", handler);
        });

        setTimeout(() => {
          // Emit multiple events
          emitter.emit("change", { value: "first" });
          emitter.emit("change", { value: "second" });
          emitter.emit("change", { value: "third" });

          expect(handler).toHaveBeenCalledTimes(3);
          expect(handler).toHaveBeenNthCalledWith(1, { value: "first" });
          expect(handler).toHaveBeenNthCalledWith(2, { value: "second" });
          expect(handler).toHaveBeenNthCalledWith(3, { value: "third" });

          dispose();
          resolve();
        }, 50);
      });
    });
  });

  test("should unsubscribe on dispose", async () => {
    await new Promise<void>((resolve) => {
      const emitter = new EventEmitter<TestEvents>();
      const handler = vi.fn();

      createRoot((dispose) => {
        createEffect(() => {
          useEvent<TestEvents>(emitter, "change", handler);
        });

        setTimeout(() => {
          // Emit event before dispose
          emitter.emit("change", { value: "before" });
          expect(handler).toHaveBeenCalledTimes(1);

          // Dispose
          dispose();

          // Emit event after dispose
          emitter.emit("change", { value: "after" });

          // Handler should not be called again
          expect(handler).toHaveBeenCalledTimes(1);
          resolve();
        }, 50);
      });
    });
  });

  test("should work with different event types", async () => {
    await new Promise<void>((resolve) => {
      const emitter = new EventEmitter<TestEvents>();
      const changeHandler = vi.fn();
      const saveHandler = vi.fn();
      const deleteHandler = vi.fn();

      createRoot((dispose) => {
        createEffect(() => {
          useEvent<TestEvents>(emitter, "change", changeHandler);
          useEvent<TestEvents>(emitter, "save", saveHandler);
          useEvent<TestEvents>(emitter, "delete", deleteHandler);
        });

        setTimeout(() => {
          emitter.emit("change", { value: "test" });
          emitter.emit("save", { id: 123 });
          emitter.emit("delete", undefined);

          expect(changeHandler).toHaveBeenCalledWith({ value: "test" });
          expect(saveHandler).toHaveBeenCalledWith({ id: 123 });
          expect(deleteHandler).toHaveBeenCalledWith(undefined);

          dispose();
          resolve();
        }, 50);
      });
    });
  });

  test("should handle void event payloads", async () => {
    await new Promise<void>((resolve) => {
      const emitter = new EventEmitter<TestEvents>();
      const handler = vi.fn();

      createRoot((dispose) => {
        createEffect(() => {
          useEvent<TestEvents>(emitter, "delete", handler);
        });

        setTimeout(() => {
          emitter.emit("delete", undefined);

          expect(handler).toHaveBeenCalledWith(undefined);

          dispose();
          resolve();
        }, 50);
      });
    });
  });

  test("should allow multiple handlers for same event", async () => {
    await new Promise<void>((resolve) => {
      const emitter = new EventEmitter<TestEvents>();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      createRoot((dispose) => {
        createEffect(() => {
          useEvent<TestEvents>(emitter, "change", handler1);
          useEvent<TestEvents>(emitter, "change", handler2);
        });

        setTimeout(() => {
          emitter.emit("change", { value: "test" });

          expect(handler1).toHaveBeenCalledWith({ value: "test" });
          expect(handler2).toHaveBeenCalledWith({ value: "test" });

          dispose();
          resolve();
        }, 50);
      });
    });
  });

  test("should cleanup properly even if emitter continues to exist", async () => {
    await new Promise<void>((resolve) => {
      const emitter = new EventEmitter<TestEvents>();
      const handler = vi.fn();

      createRoot((dispose) => {
        createEffect(() => {
          useEvent<TestEvents>(emitter, "change", handler);
        });

        setTimeout(() => {
          emitter.emit("change", { value: "inside" });
          expect(handler).toHaveBeenCalledTimes(1);

          dispose();

          // After disposal, emitter should not trigger handler
          emitter.emit("change", { value: "outside" });
          expect(handler).toHaveBeenCalledTimes(1);

          resolve();
        }, 50);
      });
    });
  });
});
