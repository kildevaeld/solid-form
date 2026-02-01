import { Equallity, EventEmitter, isEqual } from "@kildevaeld/model";
import { Field, type FieldOptions } from "./field.js";
import { min, pattern, ValidationError } from "./validator.js";

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

export type FormEvents<T> = MapFieldChange<T> &
  MapFieldValidate<T> & {
    change: { prev: T | undefined; value: T | undefined; field: keyof T };
    validate:
      | { status: "valid" }
      | { status: "invalid"; errors: { [K in keyof T]?: ValidationError[] } };
  };

export interface FormOptions<T extends FormFields> {
  defaultValues?: Partial<T>;
  fields?: Partial<{ [K in keyof T]: Omit<FieldOptions<K, T[K]>, "name"> }>;
}

export class Form<T extends FormFields> extends EventEmitter<FormEvents<T>> {
  #fields: { [K in keyof T]?: Field<K, T[K]> } = {};
  #equal: Equallity<T[keyof T]>;
  #validationErrors: { [K in keyof T]?: ValidationError[] } = {};
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
      this.#createField({
        name: key,
        value: options.defaultValues?.[key],
      });
    }
  }

  get validationErrors() {
    return { ...this.#validationErrors };
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

  validate() {
    this.#validationErrors = {};
    let failed = false;
    for (const k in this.#fields) {
      if (!this.#fields[k]?.validate()) {
        failed = true;
      }
    }

    this.emit(
      "validate",
      failed
        ? { status: "invalid", errors: { ...this.#validationErrors } }
        : { status: "valid" },
    );
  }

  toJSON() {
    const out: Record<string, any> = {};
    for (const key in this.#fields) {
      out[key] = this.#fields[key]?.value;
    }
    return out;
  }

  #createField<K extends keyof T>(options: FieldOptions<K, T[K]>) {
    const field = new Field(options, this.#equal);
    this.#fields[options.name] = field;
    field.on("change", (e) => {
      this.emit(`change:${String(options.name)}` as any, e as any);
      this.emit("change", {
        value: e.value,
        prev: e.prev,
        field: options.name,
      } as any);
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
}

const form = new Form<{ name: string; age: number }>({
  fields: {
    name: {
      required: true,
      value: "Name",
      validations: [pattern(/\w/), min(210)],
    },
    age: {
      validations: [min(18)],
    },
  },
});

form.field("name").on("change", (e) => {
  console.log(e);
});

console.log(form.field("name").value);
