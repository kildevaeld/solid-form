export * from "./emitter.js";
export * from "./model.js";
export * from "./collection.js";
export * from "./value.js";

export interface CommonEvents<T> {
  change: { prev: T; value: T };
}
