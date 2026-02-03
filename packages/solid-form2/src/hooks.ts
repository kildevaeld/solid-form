import type { IEventEmitter, Subscription } from "@kildevaeld/model";
import { onCleanup } from "solid-js";

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
  emitter: IEventEmitter<E>,
  options: EventOptions<E>,
) {
  const subscriptions: Subscription[] = [];
  for (const k in options) {
    const v = options[k] as (payload: E[keyof E]) => void;
    subscriptions.push(emitter.on(k, v));
  }

  onCleanup(() => {
    for (const subsciption of subscriptions) {
      subsciption();
    }
  });
}
