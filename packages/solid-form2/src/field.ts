import type { Field, FormFields, ValidationError } from "@kildevaeld/form";
import {
  InputController,
  SelectController,
  ValidateMode,
} from "@kildevaeld/form/dom";
import { createTriggerCache } from "@solid-primitives/trigger";
import { Accessor, onCleanup } from "solid-js";

export interface FieldApi<T> {
  value: Accessor<T | undefined>;
  setValue(value: T | undefined): void;
  control: <E extends HTMLElement>(
    el: E,
    p?: Accessor<true | "input" | "change">,
  ) => void;
  errors: Accessor<ValidationError[]>;
  validate(): Promise<boolean>;
}

export function createField<K extends keyof T, T extends FormFields>(
  field: Field<K, T[K]>,
  validationMode: ValidateMode,
) {
  const [track, dirty] = createTriggerCache<"$value" | "$errors">();

  onCleanup(
    field.on("change", () => {
      dirty("$value");
    }),
  );

  onCleanup(
    field.on("validate", () => {
      dirty("$errors");
    }),
  );

  return {
    name: field.name,
    setValue(value: T[K]) {
      field.set(value);
    },
    validate() {
      return field.validate();
    },
    dirty: () => {
      track("$value");
      return field.isDirty;
    },
    value() {
      track("$value");
      return field.value;
    },
    errors() {
      track("$errors");
      return field.errors;
    },
    control: createControl(field as Field<string, T>, validationMode),
  };
}

export function createControl<T extends FormFields>(
  field: Field<string, T>,
  validateMode: ValidateMode,
) {
  return <E extends HTMLElement>(
    el: E,
    p?: Accessor<true | "input" | "change">,
  ) => {
    let ctrl;
    if (el instanceof HTMLInputElement) {
      ctrl = new InputController(el, {
        field,
        validateMode,
      });
    } else if (el instanceof HTMLSelectElement) {
      ctrl = new SelectController(el, {
        field,
        validateMode,
      });
    } else {
      ctrl = new InputController(el, {
        field,
        validateMode,
      });
    }

    ctrl.enable();

    onCleanup(() => {
      ctrl.disable();
    });
  };
}
