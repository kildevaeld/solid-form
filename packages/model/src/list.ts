import { EventEmitter, IEventEmitter } from "./emitter.js";

export interface IObservableList<T> extends IEventEmitter<ListEvents<T>> {
  insert(index: number, value: T): void;
  push(...items: T[]): void;
  pop(): T | undefined;
  remove(index: number): T;
  at(index: number): T | undefined;
  map<U>(mapper: (value: T) => U): ObservableList<U>;
  filter(mapper: (value: T) => boolean): ObservableList<T>;
  find(mapper: (value: T) => boolean): T | undefined;
  toJSON(): T[];

  [Symbol.iterator](): IterableIterator<T>;
}

export type ListChangeEvent<T> =
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

export interface ListEvents<T> {
  change: ListChangeEvent<T>;
}

export class ObservableList<T>
  implements IEventEmitter<ListEvents<T>>, IObservableList<T>
{
  #values: T[];
  #emitter: EventEmitter<ListEvents<T>> = new EventEmitter();
  constructor(values: T[] = []) {
    this.#values = values;
  }

  on<K extends keyof ListEvents<T>>(
    event: K,
    listener: (payload: ListEvents<T>[K]) => void,
  ) {
    return this.#emitter.on(event, listener);
  }

  off<K extends keyof ListEvents<T>>(
    event: K,
    listener: (payload: ListEvents<T>[K]) => void,
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

  map<U>(mapper: (value: T) => U): ObservableList<U> {
    return new ObservableList(this.#values.map(mapper));
  }

  filter(mapper: (value: T) => boolean): ObservableList<T> {
    return new ObservableList(this.#values.filter(mapper));
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
