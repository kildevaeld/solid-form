import { EventEmitter, IEventEmitter } from "./emitter.js";

export type CollectionChangeEvent<T> =
  | {
      type: "insert";
      item: T;
      prev: T;
    }
  | {
      type: "push";
      items: T[];
    }
  | { type: "pop"; item: T | undefined }
  | { type: "remove"; item: T; index: number };

export interface CollectionEvents<T> {
  change: CollectionChangeEvent<T>;
}

export class Collection<T> implements IEventEmitter<CollectionEvents<T>> {
  #values: T[];
  #emitter: EventEmitter<CollectionEvents<T>> = new EventEmitter();
  constructor(values: T[] = []) {
    this.#values = values;
  }

  on<K extends keyof CollectionEvents<T>>(
    event: K,
    listener: (payload: CollectionEvents<T>[K]) => void,
  ) {
    return this.#emitter.on(event, listener);
  }

  off<K extends keyof CollectionEvents<T>>(
    event: K,
    listener: (payload: CollectionEvents<T>[K]) => void,
  ) {
    this.#emitter.off(event, listener);
  }

  get length() {
    return this.#values.length;
  }

  set length(length: number) {
    this.#values.length = length;
  }

  insert(index: number, value: T) {
    if (index >= this.#values.length || index < 0) {
      throw new RangeError("Invalid index");
    }

    const prev = this.#values[index];
    this.#values[index] = value;
    if (prev !== value)
      this.#emitter.emit("change", { type: "insert", item: value, prev });
  }

  push(...items: T[]) {
    this.#values.push(...items);
    this.#emitter.emit("change", { type: "push", items: items });
  }

  pop() {
    const value = this.#values.pop();
    this.#emitter.emit("change", { type: "pop", item: value });

    return value;
  }

  remove(index: number) {
    if (index >= this.#values.length || index < 0) {
      throw new RangeError("Invalid index");
    }

    let removed = this.#values.splice(index, 1);
    this.#emitter.emit("change", { type: "remove", index, item: removed[0] });

    return removed[0];
  }

  at(index: number) {
    return this.#values[index];
  }

  map<U>(mapper: (value: T) => U): Collection<U> {
    return new Collection(this.#values.map(mapper));
  }

  filter(mapper: (value: T) => boolean): Collection<T> {
    return new Collection(this.#values.filter(mapper));
  }

  find(mapper: (value: T) => boolean): T | undefined {
    return this.#values.find(mapper);
  }

  toJSON() {
    return [...this.#values];
  }

  [Symbol.iterator]() {
    const inner = this.#values[Symbol.iterator]();
    return inner;
  }
}
