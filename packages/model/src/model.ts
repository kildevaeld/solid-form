import { Base, ChangeEvent } from "./base.js";
import { EventEmitter, IEventEmitter, Subscription } from "./emitter.js";
import { Equallity } from "./util.js";

export interface ModelFields {}

type MapFieldChange<T> = {
  [K in keyof T as K extends string ? `change:${K}` : never]: {
    prev: T[K] | undefined;
    value: T[K] | undefined;
  };
};

type ModelEvents<T extends ModelFields> = MapFieldChange<T> & {
  change: {
    key: keyof T;
    value: T[keyof T] | undefined;
    prev: T[keyof T] | undefined;
  };
};

export class Model<T extends { [key: string]: any }>
  extends Base<T>
  implements IEventEmitter<ModelEvents<T>>
{
  #emitter: EventEmitter<ModelEvents<T>> = new EventEmitter();
  #values: { [K in keyof T]?: T[K] };
  #equal: Equallity<T[string]>;

  constructor(
    values: Partial<T> = {},
    equal: Equallity<T[string]> = (a, b) => a === b,
  ) {
    super();
    this.#values = values;
    this.#equal = equal;
  }

  get<K extends keyof T>(field: K): T[K] | undefined {
    return this.#values[field];
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

  on<K extends keyof ModelEvents<T>>(
    event: K,
    listener: (payload: ModelEvents<T>[K]) => void,
  ) {
    return this.#emitter.on(event, listener);
  }

  off<K extends keyof ModelEvents<T>>(
    event: K,
    listener: (payload: ModelEvents<T>[K]) => void,
  ) {
    this.#emitter.off(event, listener);
  }

  [Symbol.iterator]() {
    return Object.entries(this.#values);
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

  subscribe(observer: (value: ChangeEvent<T>) => void): Subscription {
    return this.on("change", (e) =>
      observer({ value: this.values, prev: this.values } as any),
    );
  }
}
