export type Subscription = () => void;

export interface IEventEmitter<T> {
  on<K extends keyof T>(
    event: K,
    listener: (payload: T[K]) => void,
  ): Subscription;

  off<K extends keyof T>(event: K, listener: (payload: T[K]) => void): void;
}

export class EventEmitter<T> implements IEventEmitter<T> {
  private listeners: {
    [K in keyof T]?: Array<(payload: T[K]) => void>;
  } = {};

  constructor() {}

  on<K extends keyof T>(
    event: K,
    listener: (payload: T[K]) => void,
  ): Subscription {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
    return () => this.off(event, listener);
  }

  off<K extends keyof T>(event: K, listener: (payload: T[K]) => void) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event]!.filter(
      (l) => l !== listener,
    );
  }

  emit<K extends keyof T>(event: K, payload: T[K]) {
    if (!this.listeners[event]) return;
    for (const listener of this.listeners[event]!) {
      listener(payload);
    }
  }
}
