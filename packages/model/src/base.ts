import { IEventEmitter, Subscription } from "./emitter.js";

export interface ChangeEvent<T> {
  prev: T;
  value: T;
}

export const REACTIVE = Symbol("MODEL_REACTIVE");

export abstract class Base<T> {
  [REACTIVE] = true;
  constructor() {}
  abstract subscribe(observer: (value: ChangeEvent<T>) => void): Subscription;
}

export interface BaseEvent<T> {
  change: ChangeEvent<T>;
}

export function isBase<T>(a: unknown): a is IEventEmitter<BaseEvent<T>> {
  return a && (a as any)[REACTIVE];
}

export function watch<T>(
  item: Base<T>,
  fn: (event: ChangeEvent<T>) => void,
): Subscription {
  return item.subscribe(fn);
}
