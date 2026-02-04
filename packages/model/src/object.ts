import { Base, ChangeEvent } from "./base.js";
import { EventEmitter, IEventEmitter, Subscription } from "./emitter.js";
import { Equality, isEqual } from "./util.js";

export interface IObservableObject<T> extends IEventEmitter<
  ObservableObjectEvents<T>
> {
  get<K extends keyof T>(field: K): T[K];
  set<K extends keyof T>(field: K, value: T[K]): void;

  [Symbol.iterator](): IterableIterator<[keyof T, T[keyof T]]>;

  entries(): Iterable<[keyof T, T[keyof T]]>;
  values(): Iterable<T[keyof T]>;
  keys(): Iterable<keyof T>;

  toJSON(): T;
}

type ObjectFieldChange<T> = {
  [K in keyof T as K extends string ? `change:${K}` : never]: {
    prev: T[K];
    value: T[K];
  };
};

export type ObservableObjectEvents<T> = ObjectFieldChange<T> & {
  change: {
    key: keyof T;
    value: T[keyof T];
    prev: T[keyof T];
  };
};

export type ObservableObjectSchema = {
  [key: PropertyKey]: any;
};

export class ObservableObject<T extends { [key: PropertyKey]: any }>
  extends Base<T>
  implements IEventEmitter<ObservableObjectEvents<T>>, IObservableObject<T>
{
  #emitter: EventEmitter<ObservableObjectEvents<T>> = new EventEmitter();
  #values: { [K in keyof T]?: T[K] };
  #equal: Equality<T[PropertyKey]>;

  constructor(values: T, equal: Equality<T[PropertyKey]> = isEqual) {
    super();
    this.#values = values;
    this.#equal = equal;
  }

  get<K extends keyof T>(field: K): T[K] {
    return this.#values[field]!;
  }

  set<K extends keyof T>(field: K, value: T[K] | undefined) {
    const trigger = !this.#equal(this.#values[field], value);
    const prev = this.#values[field];
    this.#values[field] = value;
    if (trigger) {
      this.#emitter.emit(`change:${String(field)}`, {
        value,
        prev,
      } as any);

      this.#emitter.emit(`change`, {
        key: field,
        value,
        prev,
      } as any);
    }
  }

  on<K extends keyof ObservableObjectEvents<T>>(
    event: K,
    listener: (payload: ObservableObjectEvents<T>[K]) => void,
  ) {
    return this.#emitter.on(event, listener);
  }

  off<K extends keyof ObservableObjectEvents<T>>(
    event: K,
    listener: (payload: ObservableObjectEvents<T>[K]) => void,
  ) {
    this.#emitter.off(event, listener);
  }

  [Symbol.iterator](): IterableIterator<[keyof T, T[keyof T]]> {
    return Object.entries(this.#values)[Symbol.iterator]();
  }

  entries() {
    return Object.entries(this.#values);
  }

  values() {
    return Object.values(this.#values);
  }

  keys() {
    return Object.keys(this.#values);
  }

  toJSON() {
    return { ...this.#values } as T;
  }

  subscribe(observer: (value: ChangeEvent<T>) => void): Subscription {
    return this.on("change", (e) =>
      observer({ value: this.values, prev: this.values } as any),
    );
  }
}
