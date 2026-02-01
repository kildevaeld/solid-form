import { EventEmitter, IEventEmitter, Subscription } from "./emitter.js";

export interface ChangeEvent<T> {
  prev: T;
  value: T;
}

export abstract class Base<T> {
  abstract subscribe(observer: (value: ChangeEvent<T>) => void): Subscription;
}

export interface BaseEvent<T> {
  change: ChangeEvent<T>;
}

export const REACTIVE = Symbol("MODEL_REACTIVE");

export function isBase<T>(a: unknown): a is IEventEmitter<BaseEvent<T>> {
  return a && (a as any)[REACTIVE];
}

export function watch<T>(item: Base<T>) {
  return item.subscribe(() => {});
}
