import { Form, type FormFields, type FormOptions } from "@kildevaeld/form";
import { Accessor, batch, createEffect, onCleanup } from "solid-js";
import { createField, FieldApi } from "./field";
import { createTriggerCache } from "@solid-primitives/trigger";
import { ValidateMode } from "@kildevaeld/form/dom";
import { useEvents } from "./hooks";

export interface CreateFormOptions<T extends FormFields> {
  defaultValues?: Accessor<Partial<T> | undefined>;
  fields?: Omit<FormOptions<T>["fields"], "value">;
  submit?: (values: T) => Promise<void> | void;
  validationMode?: ValidateMode;
}

export function createForm<T extends FormFields>(
  options: CreateFormOptions<T>,
) {
  const form = new Form<T>({
    fields: options.fields,
    defaultValues: options.defaultValues?.(),
  });

  const [track, dirty] = createTriggerCache<
    "$value" | "$status" | "$dirty" | "$valid"
  >();

  const cache = {
    status: form.status,
    valid: form.isValid,
    dirty: form.isDirty,
  };

  useEvents(form, {
    change: () => {
      dirty("$value");
    },
    statusChange: () => {
      batch(() => {
        dirty("$status");
        if (form.status === "idle") {
          if (cache.valid !== form.isValid) {
            cache.valid = form.isValid;
            dirty("$valid");
          }
          if (cache.dirty !== form.isDirty) {
            cache.dirty = form.isDirty;
            dirty("$dirty");
          }
        }
      });
    },
  });

  const fields = new Map<keyof T, FieldApi<T[keyof T]>>();

  return {
    field<K extends keyof T>(name: K) {
      let fieldApi = fields.get(name);
      if (!fieldApi) {
        fieldApi = createField(
          form.field(name),
          options.validationMode ?? "change",
        );
        fields.set(name, fieldApi);
      }
      return fields.get(name) as FieldApi<T[K]>;
    },
    async submit(e: SubmitEvent) {
      e.preventDefault();
      if (options.validationMode === "submit") {
        await form.validate();
        if (!form.isValid) {
          return;
        }
      }
      await form.submit(async (values) => {
        await options.submit?.(values);
      });
    },
    reset() {
      form.reset();
    },
    validate() {
      return form.validate();
    },
    valid: () => {
      track("$valid");
      return form.isValid;
    },
    dirty: () => {
      track("$dirty");
      return form.isDirty;
    },
    values: () => {
      track("$value");
      return form.toJSON();
    },
    status: () => {
      track("$status");
      return form.status;
    },
    isSubmitting: () => {
      track("$status");
      return form.status === "submitting";
    },
    form,
  };
}
