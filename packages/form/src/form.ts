import { type Equality, EventEmitter, isEqual } from "@kildevaeld/model";
import { Field, type FieldOptions } from "./field.js";
import { ValidationError } from "./validator.js";

type MapFieldChange<T> = {
  [K in keyof T as K extends string ? `change:${K}` : never]: {
    prev: T[K] | undefined;
    value: T[K] | undefined;
  };
};

type MapFieldValidate<T> = {
  [K in keyof T as K extends string ? `validate:${K}` : never]:
    | {
        status: "valid";
      }
    | { status: "invalid"; errors: ValidationError[] };
};

export interface FormFields {}

export type FormStatus =
  | "validating"
  | "submitting"
  | "idle"
  | "resetting"
  | "clearing";

export type FormEvents<T> = MapFieldChange<T> &
  MapFieldValidate<T> & {
    change: {};
    validate:
      | { status: "valid" }
      | { status: "invalid"; errors: { [K in keyof T]?: ValidationError[] } };
    statusChange: { prev: FormStatus; status: FormStatus };
    submit: { status: "ok" } | { status: "error"; error: Error };
  };

type Simplify<T> = { [K in keyof T]: T[K] };

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export interface FormOptions<T extends FormFields> {
  defaultValues?: Partial<T>;
  fields?: Partial<{ [K in keyof T]: Omit<FieldOptions<K, T[K]>, "name"> }>;
}

export class Form<T extends FormFields> extends EventEmitter<FormEvents<T>> {
  #fields: { [K in keyof T]?: Field<K, T[K]> } = {};
  #equal: Equality<T[keyof T]>;
  #validationErrors: { [K in keyof T]?: ValidationError[] } = {};
  #submitError?: Error;
  #status: FormStatus = "idle";
  constructor(options: FormOptions<T>, equal = isEqual) {
    super();
    this.#equal = equal;

    if (options.fields) {
      for (const key in options.fields) {
        this.#createField({
          name: key,
          value: options.defaultValues?.[key],
          ...options.fields[key],
        });
      }
    }

    for (const key in options.defaultValues) {
      if (!this.#fields[key]) {
        this.#createField({
          name: key,
          value: options.defaultValues?.[key],
        });
      }
    }
  }

  get status() {
    return this.#status;
  }

  get isDirty() {
    for (const k in this.#fields) {
      if (this.#fields[k]?.isDirty) {
        return true;
      }
    }
    return false;
  }

  get validationErrors() {
    return { ...this.#validationErrors };
  }

  get submitError() {
    return this.#submitError;
  }

  get isValid(): boolean {
    return Object.values(this.#fields as Record<string, Field<any, any>>).every(
      (m) => m.isValid,
    );
  }

  field<K extends keyof T>(name: K): Field<K, T[K]> {
    if (!this.#fields[name]) {
      this.#createField({ name });
    }
    return this.#fields[name]!;
  }

  async validate() {
    this.#setStatus("validating");

    this.#validationErrors = {};
    let failed = false;
    for (const k in this.#fields) {
      if (!(await this.#fields[k]?.validate())) {
        failed = true;
      }
    }

    this.emit(
      "validate",
      failed
        ? { status: "invalid", errors: { ...this.#validationErrors } }
        : { status: "valid" },
    );

    this.#setStatus("idle");
  }

  async submit(func: (value: T) => Promise<void> | void) {
    this.#setStatus("submitting");
    this.#submitError = void 0;
    try {
      await func(this.toJSON());
      this.emit("submit", { status: "ok" });
    } catch (e) {
      this.#submitError = e instanceof Error ? e : new Error(String(e));
      this.emit("submit", { status: "error", error: this.#submitError });
    } finally {
      this.#setStatus("idle");
    }
  }

  reset(defaultValues?: Partial<T>) {
    this.#setStatus("resetting");

    this.#submitError = void 0;
    this.#validationErrors = {};

    let changed = false;
    for (const name in this.#fields) {
      const field = this.#fields[name]!;
      if (defaultValues) {
        field.defaultValue = defaultValues?.[name];
      }
      if (field?.reset()) {
        changed = true;
      }
    }

    //if (changed) {
    this.emit("change", {} as any);
    //}

    this.#setStatus("idle");
  }

  clear() {
    this.#setStatus("clearing");
    this.#submitError = void 0;
    this.#validationErrors = {};
    let changed = false;
    for (const key in this.#fields) {
      if (this.#fields[key]?.set(void 0)) {
        changed = true;
      }
    }

    if (changed) {
      this.emit("change", {} as any);
    }

    this.#setStatus("idle");
  }

  toJSON(): T {
    const out: Record<string, any> = {};
    for (const key in this.#fields) {
      out[key] = this.#fields[key]?.value;
    }
    return out as T;
  }

  #createField<K extends keyof T>(options: FieldOptions<K, T[K]>) {
    const field = new Field(options, this.#equal);
    this.#fields[options.name] = field;
    field.on("change", (e) => {
      this.emit(`change:${String(options.name)}` as any, e as any);
      if (this.#status === "idle") {
        this.emit("change" as any, {});
      }
    });

    field.on("validate", (e) => {
      if (e.status == "valid") {
        delete this.#validationErrors[options.name];
      } else {
        this.#validationErrors[options.name] = e.errors;
      }

      this.emit(`validate:${String(options.name)}` as any, e);
    });
  }

  #setStatus(status: FormStatus) {
    const prev = this.#status;
    this.#status = status;

    if (prev !== status) {
      this.emit("statusChange", { prev, status } as any);
    }
  }
}
