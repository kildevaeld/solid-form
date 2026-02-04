import type { IEventEmitter, Subscription } from "@kildevaeld/model";
import { Accessor, createEffect, onCleanup } from "solid-js";
import { e } from "../../form/dist/field-C_JBlJF9";

export function useEvent<E, K extends keyof E = keyof E>(
  emitter: IEventEmitter<E>,
  event: K,
  handler: (payload: E[K]) => void,
) {
  onCleanup(emitter.on(event, handler));
}

export type EventOptions<T> = {
  [K in keyof T]?: (payload: T[K]) => void;
};

export function useEvents<E>(
  emitter: Accessor<IEventEmitter<E> | undefined> | IEventEmitter<E>,
  options: Accessor<EventOptions<E>> | EventOptions<E>,
) {
  createEffect(() => {
    const emitterRef = typeof emitter === "function" ? emitter() : emitter;
    const optionsRef = typeof options === "function" ? options() : options;

    if (emitterRef === undefined) {
      return;
    }

    const subscriptions: Subscription[] = [];
    for (const k in optionsRef) {
      const v = optionsRef[k] as (payload: E[keyof E]) => void;
      subscriptions.push(emitterRef.on(k, v));
    }

    onCleanup(() => {
      for (const subsciption of subscriptions) {
        subsciption();
      }
    });
  });
}
