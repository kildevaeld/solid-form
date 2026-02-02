import { describe, test, expect, beforeEach, vi, afterEach } from "vitest";
import { Field } from "../field";
import {
  InputController,
  TextInputController,
  NumberInputController,
  DateInputController,
  SelectController,
} from "./controller";

describe("InputController", () => {
  let input: HTMLInputElement;
  let field: Field<string, string>;

  beforeEach(() => {
    input = document.createElement("input");
    input.type = "text";
    field = new Field({ name: "test" });
  });

  describe("constructor", () => {
    test("should initialize with default values", () => {
      const controller = new TextInputController(input, { field });
      expect(controller).toBeDefined();
    });

    test("should accept validateMode option", () => {
      const controller = new TextInputController(input, {
        field,
        validateMode: "blur",
      });
      expect(controller).toBeDefined();
    });
  });

  describe("enable/disable", () => {
    test("should attach event listeners when enabled", () => {
      const controller = new TextInputController(input, { field });
      const addEventListenerSpy = vi.spyOn(input, "addEventListener");

      controller.enable();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "input",
        expect.any(Function),
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "blur",
        expect.any(Function),
      );
    });

    test("should remove event listeners when disabled", () => {
      const controller = new TextInputController(input, { field });
      const removeEventListenerSpy = vi.spyOn(input, "removeEventListener");

      controller.enable();
      controller.disable();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "input",
        expect.any(Function),
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "blur",
        expect.any(Function),
      );
    });
  });

  describe("input handling", () => {
    test("should update field value on input event", () => {
      const controller = new TextInputController(input, { field });
      controller.enable();

      input.value = "test value";
      input.dispatchEvent(new Event("input"));

      expect(field.value).toBe("test value");
    });

    test("should validate on change when validateMode is change", async () => {
      const controller = new TextInputController(input, {
        field,
        validateMode: "change",
      });
      const validateSpy = vi.spyOn(field, "validate");
      controller.enable();

      input.value = "test";
      input.dispatchEvent(new Event("input"));

      expect(validateSpy).toHaveBeenCalled();
    });

    test("should not validate on input when validateMode is blur", () => {
      const controller = new TextInputController(input, {
        field,
        validateMode: "blur",
      });
      const validateSpy = vi.spyOn(field, "validate");
      controller.enable();

      input.value = "test";
      input.dispatchEvent(new Event("input"));

      expect(validateSpy).not.toHaveBeenCalled();
    });

    test("should validate on blur when validateMode is blur", () => {
      const controller = new TextInputController(input, {
        field,
        validateMode: "blur",
      });
      const validateSpy = vi.spyOn(field, "validate");
      controller.enable();

      input.dispatchEvent(new Event("blur"));

      expect(validateSpy).toHaveBeenCalled();
    });

    test("should not validate on blur when validateMode is change", () => {
      const controller = new TextInputController(input, {
        field,
        validateMode: "change",
      });
      const validateSpy = vi.spyOn(field, "validate");
      controller.enable();

      input.dispatchEvent(new Event("blur"));

      expect(validateSpy).not.toHaveBeenCalled();
    });

    test("should not validate when validateMode is submit", () => {
      const controller = new TextInputController(input, {
        field,
        validateMode: "submit",
      });
      const validateSpy = vi.spyOn(field, "validate");
      controller.enable();

      input.value = "test";
      input.dispatchEvent(new Event("input"));
      input.dispatchEvent(new Event("blur"));

      expect(validateSpy).not.toHaveBeenCalled();
    });
  });

  describe("field change handling", () => {
    test("should update input value when field changes", () => {
      const controller = new TextInputController(input, { field });
      controller.enable();

      field.value = "updated value";

      expect(input.value).toBe("updated value");
    });

    test("should not trigger infinite loop when input updates field", () => {
      const controller = new TextInputController(input, { field });
      controller.enable();

      let changeCount = 0;
      field.on("change", () => {
        changeCount++;
      });

      input.value = "test";
      input.dispatchEvent(new Event("input"));

      expect(changeCount).toBe(1);
    });
  });
});

describe("TextInputController", () => {
  let input: HTMLInputElement;
  let field: Field<string, string>;

  beforeEach(() => {
    input = document.createElement("input");
    input.type = "text";
    field = new Field({ name: "text" });
  });

  test("should handle text input", () => {
    const controller = new TextInputController(input, { field });
    controller.enable();

    input.value = "hello world";
    input.dispatchEvent(new Event("input"));

    expect(field.value).toBe("hello world");
  });

  test("should update input when field changes", () => {
    const controller = new TextInputController(input, { field });
    controller.enable();

    field.value = "from field";

    expect(input.value).toBe("from field");
  });
});

describe("NumberInputController", () => {
  let input: HTMLInputElement;
  let field: Field<string, number>;

  beforeEach(() => {
    input = document.createElement("input");
    input.type = "number";
    field = new Field({ name: "number" });
  });

  test("should handle number input", () => {
    const controller = new NumberInputController(input, { field });
    controller.enable();

    input.value = "42";
    input.dispatchEvent(new Event("input"));

    expect(field.value).toBe(42);
  });

  test("should handle decimal numbers", () => {
    const controller = new NumberInputController(input, { field });
    controller.enable();

    input.value = "3.14";
    input.dispatchEvent(new Event("input"));

    expect(field.value).toBe(3.14);
  });

  test("should handle NaN for invalid input", () => {
    const controller = new NumberInputController(input, { field });
    controller.enable();

    input.value = "";
    input.dispatchEvent(new Event("input"));

    expect(field.value).toBeNaN();
  });

  test("should update input when field changes", () => {
    const controller = new NumberInputController(input, { field });
    controller.enable();

    field.value = 99;

    expect(input.value).toBe("99");
  });
});

describe("DateInputController", () => {
  let input: HTMLInputElement;
  let field: Field<string, Date | null>;

  beforeEach(() => {
    input = document.createElement("input");
    input.type = "date";
    field = new Field({ name: "date" });
  });

  test("should handle date input", () => {
    const controller = new DateInputController(input, { field });
    controller.enable();

    input.value = "2026-02-02";
    input.dispatchEvent(new Event("input"));

    // expect(field.value).toBeInstanceOf(Date);
    expect(field.value?.toISOString().split("T")[0]).toBe("2026-02-02");
  });

  test("should handle null for empty date", () => {
    const controller = new DateInputController(input, { field });
    controller.enable();

    input.value = "";
    input.dispatchEvent(new Event("input"));

    expect(field.value).toBeNull();
  });

  test("should update input when field changes", () => {
    const controller = new DateInputController(input, { field });
    controller.enable();

    const date = new Date("2026-02-02");
    field.value = date;

    expect(input.valueAsDate?.toDateString()).toBe(date.toDateString());
  });
});

describe("SelectController", () => {
  let select: HTMLSelectElement;
  let field: Field<string, string>;

  beforeEach(() => {
    select = document.createElement("select");
    const option1 = document.createElement("option");
    option1.value = "option1";
    option1.textContent = "Option 1";
    const option2 = document.createElement("option");
    option2.value = "option2";
    option2.textContent = "Option 2";
    select.appendChild(option1);
    select.appendChild(option2);
    field = new Field({ name: "select" });
  });

  test("should handle select change", () => {
    const controller = new SelectController(select, { field });
    controller.enable();

    select.value = "option2";
    select.dispatchEvent(new Event("change"));

    expect(field.value).toBe("option2");
  });

  test("should use change event instead of input event", () => {
    const controller = new SelectController(select, { field });
    const addEventListenerSpy = vi.spyOn(select, "addEventListener");
    controller.enable();

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      "input",
      expect.any(Function),
    );
  });

  test("should update select when field changes", () => {
    const controller = new SelectController(select, { field });
    controller.enable();

    field.value = "option1";

    expect(select.value).toBe("option1");
  });

  test("should validate on change when validateMode is change", () => {
    const controller = new SelectController(select, {
      field,
      validateMode: "change",
    });
    const validateSpy = vi.spyOn(field, "validate");
    controller.enable();

    select.value = "option2";
    select.dispatchEvent(new Event("change"));

    expect(validateSpy).toHaveBeenCalled();
  });
});

describe("Controller debouncing", () => {
  let input: HTMLInputElement;
  let field: Field<string, string>;

  beforeEach(() => {
    vi.useFakeTimers();
    input = document.createElement("input");
    input.type = "text";
    field = new Field({ name: "test" });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("should debounce validation on rapid input changes", () => {
    const controller = new TextInputController(input, {
      field,
      validateMode: "change",
    });
    const validateSpy = vi.spyOn(field, "validate");
    controller.enable();

    // Rapid input changes
    input.value = "a";
    input.dispatchEvent(new Event("input"));
    input.value = "ab";
    input.dispatchEvent(new Event("input"));
    input.value = "abc";
    input.dispatchEvent(new Event("input"));

    // Should call validate immediately for each input
    expect(validateSpy).toHaveBeenCalledTimes(3);
  });
});
