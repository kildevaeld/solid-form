import { IEventEmitter } from "@kildevaeld/model";
import { Accessor, createEffect, onCleanup } from "solid-js";

export function useEvent<
  T extends IEventEmitter<E>,
  E extends Record<string, unknown>,
  K extends keyof E = keyof E,
>(emitter: T, event: K, handler: (payload: E[K]) => void) {
  createEffect(() => {
    onCleanup(emitter.on(event, handler));
  });
}
