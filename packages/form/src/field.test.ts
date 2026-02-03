import { describe, test, expect, beforeEach } from "vitest";
import { Field } from "./field";
import { ValidationError } from "./validator";

describe("Field", () => {
  describe("constructor", () => {
    test("should initialize with provided name and value", () => {
      const field = new Field({ name: "email", value: "test@example.com" });
      expect(field.name).toBe("email");
      expect(field.value).toBe("test@example.com");
    });

    test("should initialize with undefined value when not provided", () => {
      const field = new Field({ name: "username" });
      expect(field.value).toBeUndefined();
    });

    test("should set defaultValue from initial value", () => {
      const field = new Field({ name: "age", value: 25 });
      expect(field.defaultValue).toBe(25);
    });

    test("should initialize as not required by default", () => {
      const field = new Field({ name: "optional" });
      expect(field.isValid).toBe(true);
    });
  });

  describe("value getter and setter", () => {
    test("should get and set value", () => {
      const field = new Field({ name: "test" });
      field.value = "new value";
      expect(field.value).toBe("new value");
    });

    test("should trigger change event when value changes", () => {
      const field = new Field({ name: "test", value: "initial" });
      let changeEvent: any;
      field.on("change", (event) => {
        changeEvent = event;
      });

      field.value = "updated";

      expect(changeEvent).toBeDefined();
      expect(changeEvent.prev).toBe("initial");
      expect(changeEvent.value).toBe("updated");
    });

    test("should not trigger change event when value is the same", () => {
      const field = new Field({ name: "test", value: "same" });
      let eventTriggered = false;
      field.on("change", () => {
        eventTriggered = true;
      });

      field.value = "same";

      expect(eventTriggered).toBe(false);
    });
  });

  describe("set method", () => {
    test("should return true when value changes", () => {
      const field = new Field({ name: "test", value: "initial" });
      const changed = field.setValue("new");
      expect(changed).toBe(true);
    });

    test("should return false when value doesn't change", () => {
      const field = new Field({ name: "test", value: "same" });
      const changed = field.setValue("same");
      expect(changed).toBe(false);
    });

    test("should clear errors when value changes", () => {
      const field = new Field({ name: "test", required: true });
      field.validate();
      expect(field.errors.length).toBeGreaterThan(0);

      field.setValue("value");
      expect(field.errors.length).toBe(0);
    });
  });

  describe("reset method", () => {
    test("should reset value to defaultValue", () => {
      const field = new Field({ name: "test", value: "default" });
      field.value = "changed";
      field.reset();
      expect(field.value).toBe("default");
    });

    test("should trigger change event when resetting to different value", () => {
      const field = new Field({ name: "test", value: "default" });
      field.value = "changed";

      let eventTriggered = false;
      field.on("change", () => {
        eventTriggered = true;
      });

      field.reset();
      expect(eventTriggered).toBe(true);
    });
  });

  describe("isDirty", () => {
    test("should return false when value equals defaultValue", () => {
      const field = new Field({ name: "test", value: "initial" });
      expect(field.isDirty).toBe(false);
    });

    test("should return true when value differs from defaultValue", () => {
      const field = new Field({ name: "test", value: "initial" });
      field.value = "changed";
      expect(field.isDirty).toBe(true);
    });

    test("should return false after reset", () => {
      const field = new Field({ name: "test", value: "initial" });
      field.value = "changed";
      field.reset();
      expect(field.isDirty).toBe(false);
    });
  });

  describe("validation", () => {
    test("should validate required field with undefined value", async () => {
      const field = new Field({ name: "test", required: true });
      const isValid = await field.validate();

      expect(isValid).toBe(false);
      expect(field.errors.length).toBe(1);
      expect(field.errors[0].message).toBe("Required");
    });

    test("should validate required field with value", async () => {
      const field = new Field({ name: "test", required: true, value: "value" });
      const isValid = await field.validate();

      expect(isValid).toBe(true);
      expect(field.errors.length).toBe(0);
    });

    test("should run custom validations", async () => {
      const field = new Field({
        name: "test",
        value: "short",
        validations: [
          {
            validate: async (value: string) => {
              if (value.length < 10) {
                throw new ValidationError("Too short");
              }
            },
          },
        ],
      });

      const isValid = await field.validate();

      expect(isValid).toBe(false);
      expect(field.errors.length).toBe(1);
      expect(field.errors[0].message).toBe("Too short");
    });

    test("should pass with valid custom validation", async () => {
      const field = new Field({
        name: "test",
        value: "long enough value",
        validations: [
          {
            validate: async (value: string) => {
              if (value.length < 10) {
                throw new ValidationError("Too short");
              }
            },
          },
        ],
      });

      const isValid = await field.validate();

      expect(isValid).toBe(true);
      expect(field.errors.length).toBe(0);
    });

    test("should trigger validate event when trigger is true", async () => {
      const field = new Field({ name: "test", required: true });
      let validateEvent: any;
      field.on("validate", (event) => {
        validateEvent = event;
      });

      await field.validate();

      expect(validateEvent).toBeDefined();
      expect(validateEvent.status).toBe("invalid");
      expect(validateEvent.errors).toBeDefined();
    });

    test("should not trigger validate event when trigger is false", async () => {
      const field = new Field({ name: "test", required: true });
      let eventTriggered = false;
      field.on("validate", () => {
        eventTriggered = true;
      });

      await field.validate(false);

      expect(eventTriggered).toBe(false);
    });

    test("should emit valid status when validation passes", async () => {
      const field = new Field({ name: "test", value: "valid" });
      let validateEvent: any;
      field.on("validate", (event) => {
        validateEvent = event;
      });

      await field.validate();

      expect(validateEvent.status).toBe("valid");
    });
  });

  describe("errors", () => {
    test("should return empty array when no errors", () => {
      const field = new Field({ name: "test" });
      expect(field.errors).toEqual([]);
    });

    test("should return copy of errors array", async () => {
      const field = new Field({ name: "test", required: true });
      await field.validate();

      const errors = field.errors;
      errors.push(new ValidationError("Modified"));

      expect(field.errors.length).toBe(1);
      expect(field.errors[0].message).toBe("Required");
    });
  });

  describe("isValid", () => {
    test("should return true when no errors", () => {
      const field = new Field({ name: "test" });
      expect(field.isValid).toBe(true);
    });

    test("should return false when errors exist", async () => {
      const field = new Field({ name: "test", required: true });
      await field.validate();
      expect(field.isValid).toBe(false);
    });
  });
});
