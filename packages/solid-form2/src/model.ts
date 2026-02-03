import type { Model, ModelFields } from "@kildevaeld/model";
import { createTriggerCache } from "@solid-primitives/trigger";
import { useEvent } from "./hooks";

export function createModel<T extends ModelFields>(model: Model<T>) {
  const [track, dirty] = createTriggerCache();

  useEvent(model, "change", (e) => {
    dirty(e.key);
  });

  return {
    get<K extends keyof T>(key: K) {
      track(key);
      return model.get(key);
    },
    set<K extends keyof T>(key: K, value: T[K] | undefined) {
      model.set(key, value);
    },
  };
}
