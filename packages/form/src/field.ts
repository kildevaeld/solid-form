import { EventEmitter, type Equality, isEqual } from "@kildevaeld/model";
import { type Validation, ValidationError } from "./validator.js";

export interface FieldEvents<T> {
  change: { prev: T | undefined; value: T | undefined };
  validate:
    | { status: "valid" }
    | { status: "invalid"; errors: ValidationError[] };
}

export interface FieldOptions<K, T> {
  name: K;
  value?: T;
  required?: boolean;
  validations?: Validation<T>[];
}

export class Field<K, T> extends EventEmitter<FieldEvents<T>> {
  #value: T | undefined;
  #name: K;
  #errors: ValidationError[] = [];
  #equal: Equality<T>;
  #validations: Validation<T>[];
  #required: boolean = false;
  defaultValue: T | undefined;

  constructor(options: FieldOptions<K, T>, equal: Equality<T> = isEqual) {
    super();
    this.#name = options.name;
    this.#value = options.value;
    this.defaultValue = options.value;
    this.#equal = equal;
    this.#validations = options.validations ?? [];
    this.#required = options.required ?? false;
  }

  get name() {
    return this.#name;
  }

  get isDirty() {
    return !this.#equal(this.defaultValue, this.value);
  }

  get value(): T | undefined {
    return this.#value;
  }

  set value(value: T | undefined) {
    this.set(value);
  }

  reset() {
    return this.set(this.defaultValue);
  }

  set(value: T | undefined, trigger: boolean = true) {
    const prev = this.#value;
    this.#value = value;
    if (!this.#equal(prev, value) && trigger) {
      this.#errors.length = 0;
      this.emit("change", { prev, value });
      return true;
    } else {
      return false;
    }
  }

  get errors() {
    return this.#errors.slice();
  }

  get isValid() {
    return this.#errors.length == 0;
  }

  async validate(trigger = true) {
    this.#errors.length = 0;

    if (this.#value == undefined) {
      if (this.#required) {
        this.#errors.push(new ValidationError("Required"));
      }
    } else {
      for (const validation of this.#validations) {
        try {
          await validation.validate(this.#value);
        } catch (e) {
          if (e instanceof ValidationError) {
            this.#errors.push(e);
          } else {
            throw e;
          }
        }
      }
    }

    if (trigger)
      this.emit(
        "validate",
        this.#errors.length
          ? { status: "invalid", errors: this.#errors.slice() }
          : { status: "valid" },
      );

    return !this.#errors.length;
  }
}
