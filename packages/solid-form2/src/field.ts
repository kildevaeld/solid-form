import type { Field, FormFields, ValidationError } from "@kildevaeld/form";
import {
  InputController,
  SelectController,
  ValidateMode,
} from "@kildevaeld/form/dom";
import { createTriggerCache } from "@solid-primitives/trigger";
import { Accessor, onCleanup } from "solid-js";
import { useEvents } from "./hooks";

export interface Aria {
  readonly hint: string;
  readonly error: string;
  readonly control: string;
}

export interface FieldApi<T> {
  readonly name: string;
  readonly aria: Aria;
  value: Accessor<T | undefined>;
  setValue(value: T | undefined): void;
  control: <E extends HTMLElement>(
    el: E,
    p?: Accessor<true | "input" | "change">,
  ) => void;
  dirty: Accessor<boolean>;
  valid: Accessor<boolean>;
  errors: Accessor<ValidationError[]>;
  validate(): Promise<boolean>;
}

export function createField<K, T>(
  formId: string,
  field: Field<K, T>,
  validationMode: ValidateMode,
): FieldApi<T> {
  const [track, dirty] = createTriggerCache<"$value" | "$errors">();

  useEvents(field, {
    change: () => {
      dirty("$value");
    },
    validate: () => {
      dirty("$errors");
    },
    reset: () => {
      dirty("$errors");
    },
  });

  const prefix = `${formId}-${String(field.name)}`;

  return {
    name: field.name as string,
    aria: {
      hint: `${prefix}-hint`,
      error: `${prefix}-error`,
      control: `${prefix}-control`,
    },
    setValue(value: T) {
      field.setValue(value);
    },
    validate() {
      return field.validate();
    },
    valid() {
      track("$errors");
      return field.isValid;
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

export function createControl<T>(
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
