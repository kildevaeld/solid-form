import { Base, ChangeEvent, REACTIVE } from "./base.js";
import { EventEmitter, Subscription } from "./emitter.js";
import { Equallity, isEqual } from "./util.js";

interface ValueEvents<T> {
  change: { prev: T | undefined; value: T | undefined };
}

export class Value<T> extends Base<T | undefined> {
  [REACTIVE] = true;
  #value: T | undefined;
  #equal: Equallity<T>;
  #emitter: EventEmitter<ValueEvents<T>> = new EventEmitter();

  constructor(value?: T, equal: Equallity<T> = isEqual) {
    super();
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

  subscribe(
    observer: (value: ChangeEvent<T | undefined>) => void,
  ): Subscription {
    return this.on("change", observer);
  }
}
