import { FieldOptions } from "../field";
import { Form } from "../form.js";
import { Controller, InputController, SelectController } from "./controller.js";
import { getValue } from "./util";

function fieldFromElement(
  form: Record<string, Omit<FieldOptions<string, unknown>, "name">>,
  el: HTMLElement,
) {
  const name = el.getAttribute("name");
  if (!name) {
    throw new Error("No name");
  }

  if (el instanceof HTMLInputElement) {
    form[name] = {
      required: el.required,
      value: getValue(el),
    };
  } else if (el instanceof HTMLSelectElement) {
    form[name] = {
      required: el.required,
      value: getValue(el),
    };
  }
}

function createForm(el: HTMLFormElement) {
  let els = el.querySelectorAll("[name]");

  const fields = {};
  for (const el of els) {
    fieldFromElement(fields, el as HTMLElement);
  }

  const form = new Form<Record<string, unknown>>({
    fields,
  });

  const controllers = [];
  for (const el of els) {
    const name = el.getAttribute("name")!;
    if (el instanceof HTMLSelectElement) {
      controllers.push(
        new SelectController(el, {
          field: form.field(name),
        }),
      );
    } else {
      controllers.push(
        new InputController(el as HTMLElement, {
          field: form.field(name),
        }),
      );
    }
  }

  return new DomForm(el, controllers, form);
}

export class DomForm {
  #controllers: Controller[];
  #form: Form<Record<string, unknown>>;
  #el: HTMLFormElement;
  constructor(
    el: HTMLFormElement,
    controllers: Controller[],
    form: Form<Record<string, unknown>>,
  ) {
    this.#el = el;
    this.#controllers = controllers;
    this.#form = form;
  }

  static create(el: HTMLFormElement) {
    return createForm(el);
  }

  enable() {
    for (const ctrl of this.#controllers) {
      ctrl.enable();
    }

    this.#el.addEventListener("submit", (e) => {});
  }

  disable() {
    for (const ctrl of this.#controllers) {
      ctrl.disable();
    }
  }
}
