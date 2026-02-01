import { EventEmitter } from "./emitter.js";
import { Equallity, isEqual } from "./model.js";

interface ValueEvents<T> {
  change: { prev: T | undefined; value: T | undefined };
}

export class Value<T> {
  #value: T | undefined;
  #equal: Equallity<T>;
  #emitter: EventEmitter<ValueEvents<T>> = new EventEmitter();

  constructor(value?: T, equal: Equallity<T> = isEqual) {
    this.#value = value;
    this.#equal = equal;
  }

  get content() {
    return this.get();
  }

  set content(value: T | undefined) {
    this.set(value);
  }

  set(value: T | undefined) {
    const prev = this.#value;
    this.#value = value;
    if (!this.#equal(prev, value)) {
      this.#emitter.emit("change", { prev, value });
    }
  }

  get(): T | undefined {
    return this.#value;
  }

  on<K extends keyof ValueEvents<T>>(
    event: K,
    listener: (payload: ValueEvents<T>[K]) => void,
  ) {
    return this.#emitter.on(event, listener);
  }

  off<K extends keyof ValueEvents<T>>(
    event: K,
    listener: (payload: ValueEvents<T>[K]) => void,
  ) {
    this.#emitter.off(event, listener);
  }
}
