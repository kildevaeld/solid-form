import { Field, FieldOptions } from "../field";
import { Form } from "../form";
import { debounced, getValue, setValue } from "./util";

export type ValidateMode = "change" | "blur" | "submit";

export interface Controller {
  enable(): void;
  disable(): void;
}

export interface ControllerOptions<T> {
  field: Field<string, T>;
  validateMode?: ValidateMode;
}

export class InputController<E extends HTMLElement, T> {
  #el: E;
  #field: Field<string, T>;
  #validationMode: ValidateMode;
  #event: "input" | "change";
  #validateField: () => void;
  constructor(
    el: E,
    options: ControllerOptions<T> & { event?: "input" | "change" },
  ) {
    this.#el = el;
    this.#field = options.field;
    this.#validationMode = options.validateMode ?? "change";
    this.#event = options.event ?? "input";
    // this.#validateField = debounced(() => {
    //   this.#field.validate();
    // }, 200);
    this.#validateField = () => {
      return this.#field.validate();
    };

    setValue(el, options.field.value);
  }

  enable() {
    this.#el.addEventListener(this.#event, this.#onInput);
    this.#el.addEventListener("blur", this.#onBlur);
    this.#field.on("change", this.#onFieldChange);
  }

  disable() {
    this.#el.removeEventListener(this.#event, this.#onInput);
    this.#el.removeEventListener("blur", this.#onBlur);
    this.#field.off("change", this.#onFieldChange);
  }

  protected getValue(el: E): T {
    return getValue(el) as T;
  }

  #onInput = (e: Event) => {
    const value = this.getValue(this.#el);
    this.#field.off("change", this.#onFieldChange);
    this.#field.value = value;
    this.#field.on("change", this.#onFieldChange);

    if (this.#validationMode == "change") {
      this.#validateField();
    }
  };

  #onBlur = (e: Event) => {
    if (this.#validationMode == "blur") {
      this.#validateField();
    }
  };

  #onFieldChange = () => {
    setValue(this.#el, this.#field.value);
  };
}

export class TextInputController extends InputController<
  HTMLInputElement,
  string
> {
  protected getValue(el: HTMLInputElement): string {
    return el.value;
  }
}

export class NumberInputController extends InputController<
  HTMLInputElement,
  number
> {
  protected getValue(el: HTMLInputElement): number {
    return el.valueAsNumber;
  }
}

export class DateInputController extends InputController<
  HTMLInputElement,
  Date | null
> {
  protected getValue(el: HTMLInputElement): Date | null {
    return el.valueAsDate;
  }
}

export class SelectController<T> extends InputController<HTMLSelectElement, T> {
  constructor(el: HTMLSelectElement, options: ControllerOptions<T>) {
    super(el, {
      ...options,
      event: "change",
    });
  }
}

export type TextAreaController = InputController<HTMLTextAreaElement, string>;
