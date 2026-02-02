import { Form, type FormFields, type FormOptions } from "@kildevaeld/form";
import { Accessor, batch, createEffect, onCleanup } from "solid-js";
import { createField, FieldApi } from "./field.js";
import { createTriggerCache } from "@solid-primitives/trigger";

export interface CreateFormOptions<T extends FormFields> {
  defaultValues?: Accessor<Partial<T> | undefined>;
  fields?: Omit<FormOptions<T>["fields"], "value">;
  submit?: (values: T) => Promise<void> | void;
  validationMode?: "onChange" | "onBlur" | "onSubmit";
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

  createEffect(() => {
    onCleanup(
      form.on("change", () => {
        dirty("$value");
      }),
    );
    onCleanup(
      form.on("statusChange", () => {
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
      }),
    );
  });

  const fields = new Map<keyof T, FieldApi<T[keyof T]>>();

  return {
    field<K extends keyof T>(name: K) {
      let fieldApi = fields.get(name);
      if (!fieldApi) {
        fieldApi = createField(form.field(name));
        fields.set(name, fieldApi);
      }
      return fields.get(name) as FieldApi<T[K]>;
    },
    async submit(e: SubmitEvent) {
      e.preventDefault();
      await form.submit(async (values) => {
        await options.submit?.(values);
      });
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
