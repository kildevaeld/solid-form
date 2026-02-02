import type { Field, FormFields } from "@kildevaeld/form";
import { InputController, SelectController } from "@kildevaeld/form/dom";
import { createTriggerCache } from "@solid-primitives/trigger";
import { Accessor, onCleanup } from "solid-js";

export interface FieldApi<T> {}

export function createField<K extends keyof T, T extends FormFields>(
  field: Field<K, T[K]>,
) {
  const [track, dirty] = createTriggerCache<"$value">();

  onCleanup(
    field.on("change", () => {
      dirty("$value");
    }),
  );

  return {
    name: field.name,
    setValue(value: T[K]) {
      field.set(value);
    },
    dirty: () => {
      track("$value");
      return field.isDirty;
    },
    value() {
      track("$value");
      return field.value;
    },
    control: createControl(field as Field<string, T>),
  };
}

export function createControl<T extends FormFields>(field: Field<string, T>) {
  return <E extends HTMLElement>(
    el: E,
    p?: Accessor<true | "input" | "change">,
  ) => {
    let ctrl;
    if (el instanceof HTMLInputElement) {
      ctrl = new InputController(el, {
        field,
      });
    } else if (el instanceof HTMLSelectElement) {
      ctrl = new SelectController(el, {
        field,
      });
    } else {
      ctrl = new InputController(el, {
        field,
      });
    }

    ctrl.enable();

    onCleanup(() => {
      ctrl.disable();
    });
  };
}
