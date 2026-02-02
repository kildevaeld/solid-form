import { describe, test, expect, beforeEach, vi } from "vitest";
import { Form } from "./form";
import { ValidationError } from "./validator";

interface TestFormFields {
  username: string;
  email: string;
  age: number;
}

describe("Form", () => {
  describe("constructor", () => {
    test("should initialize with empty fields", () => {
      const form = new Form<TestFormFields>({});
      expect(form.toJSON()).toEqual({});
    });

    test("should initialize with default values", () => {
      const form = new Form<TestFormFields>({
        defaultValues: {
          username: "john",
          email: "john@example.com",
        },
      });

      expect(form.field("username").value).toBe("john");
      expect(form.field("email").value).toBe("john@example.com");
    });

    test("should initialize with field options", () => {
      const form = new Form<TestFormFields>({
        fields: {
          username: { required: true },
          email: { required: true },
        },
      });

      const usernameField = form.field("username");
      expect(usernameField).toBeDefined();
    });

    test("should merge default values with field options", () => {
      const form = new Form<TestFormFields>({
        defaultValues: {
          username: "john",
        },
        fields: {
          username: { required: true },
        },
      });

      const field = form.field("username");
      expect(field.value).toBe("john");
    });
  });

  describe("field method", () => {
    test("should get existing field", () => {
      const form = new Form<TestFormFields>({
        defaultValues: { username: "john" },
      });

      const field = form.field("username");
      expect(field.value).toBe("john");
    });

    test("should create field on-demand if it doesn't exist", () => {
      const form = new Form<TestFormFields>({});
      const field = form.field("username");

      expect(field).toBeDefined();
      expect(field.name).toBe("username");
    });

    test("should return same field instance on multiple calls", () => {
      const form = new Form<TestFormFields>({});
      const field1 = form.field("username");
      const field2 = form.field("username");

      expect(field1).toBe(field2);
    });
  });

  describe("status", () => {
    test("should initialize with idle status", () => {
      const form = new Form<TestFormFields>({});
      expect(form.status).toBe("idle");
    });

    test("should change status during validation", async () => {
      const form = new Form<TestFormFields>({
        fields: { username: { required: true } },
      });

      const statuses: string[] = [];
      form.on("statusChange", (e) => {
        statuses.push(e.status);
      });

      await form.validate();

      expect(statuses).toContain("validating");
      expect(form.status).toBe("idle");
    });

    test("should change status during submission", async () => {
      const form = new Form<TestFormFields>({
        defaultValues: { username: "john" },
      });

      const statuses: string[] = [];
      form.on("statusChange", (e) => {
        statuses.push(e.status);
      });

      await form.submit(async () => {});

      expect(statuses).toContain("submitting");
      expect(form.status).toBe("idle");
    });

    test("should change status during reset", () => {
      const form = new Form<TestFormFields>({
        defaultValues: { username: "john" },
      });

      const statuses: string[] = [];
      form.on("statusChange", (e) => {
        statuses.push(e.status);
      });

      form.reset();

      expect(statuses).toContain("resetting");
      expect(form.status).toBe("idle");
    });

    test("should change status during clear", () => {
      const form = new Form<TestFormFields>({
        defaultValues: { username: "john" },
      });

      const statuses: string[] = [];
      form.on("statusChange", (e) => {
        statuses.push(e.status);
      });

      form.clear();

      expect(statuses).toContain("clearing");
      expect(form.status).toBe("idle");
    });
  });

  describe("isDirty", () => {
    test("should return false when no fields are dirty", () => {
      const form = new Form<TestFormFields>({
        defaultValues: { username: "john" },
      });

      expect(form.isDirty).toBe(false);
    });

    test("should return true when any field is dirty", () => {
      const form = new Form<TestFormFields>({
        defaultValues: { username: "john", email: "john@example.com" },
      });

      form.field("username").value = "jane";

      expect(form.isDirty).toBe(true);
    });

    test("should return false after reset", () => {
      const form = new Form<TestFormFields>({
        defaultValues: { username: "john" },
      });

      form.field("username").value = "jane";
      form.reset();

      expect(form.isDirty).toBe(false);
    });
  });

  describe("isValid", () => {
    test("should return true when all fields are valid", () => {
      const form = new Form<TestFormFields>({
        defaultValues: { username: "john" },
        fields: { username: { required: true } },
      });

      expect(form.isValid).toBe(true);
    });

    test("should return false when any field is invalid", async () => {
      const form = new Form<TestFormFields>({
        fields: { username: { required: true } },
      });

      await form.field("username").validate();

      expect(form.isValid).toBe(false);
    });
  });

  describe("validate", () => {
    test("should validate all fields", async () => {
      const form = new Form<TestFormFields>({
        fields: {
          username: { required: true },
          email: { required: true },
        },
      });

      await form.validate();

      expect(form.field("username").isValid).toBe(false);
      expect(form.field("email").isValid).toBe(false);
    });

    test("should emit validate event with valid status", async () => {
      const form = new Form<TestFormFields>({
        defaultValues: { username: "john" },
        fields: { username: { required: true } },
      });

      let validateEvent: any;
      form.on("validate", (e) => {
        validateEvent = e;
      });

      await form.validate();

      expect(validateEvent.status).toBe("valid");
    });

    test("should emit validate event with invalid status and errors", async () => {
      const form = new Form<TestFormFields>({
        fields: {
          username: { required: true },
          email: { required: true },
        },
      });

      let validateEvent: any;
      form.on("validate", (e) => {
        validateEvent = e;
      });

      await form.validate();

      expect(validateEvent.status).toBe("invalid");
      expect(validateEvent.errors).toBeDefined();
      expect(validateEvent.errors.username).toBeDefined();
      expect(validateEvent.errors.email).toBeDefined();
    });

    test("should update validationErrors", async () => {
      const form = new Form<TestFormFields>({
        fields: { username: { required: true } },
      });

      await form.validate();

      const errors = form.validationErrors;
      expect(errors.username).toBeDefined();
      expect(errors.username?.length).toBeGreaterThan(0);
    });
  });

  describe("submit", () => {
    test("should call submit function with form values", async () => {
      const form = new Form<TestFormFields>({
        defaultValues: {
          username: "john",
          email: "john@example.com",
        },
      });

      const submitFn = vi.fn();
      await form.submit(submitFn);

      expect(submitFn).toHaveBeenCalledWith({
        username: "john",
        email: "john@example.com",
      });
    });

    test("should emit submit event with ok status on success", async () => {
      const form = new Form<TestFormFields>({
        defaultValues: { username: "john" },
      });

      let submitEvent: any;
      form.on("submit", (e) => {
        submitEvent = e;
      });

      await form.submit(async () => {});

      expect(submitEvent.status).toBe("ok");
    });

    test("should emit submit event with error status on failure", async () => {
      const form = new Form<TestFormFields>({
        defaultValues: { username: "john" },
      });

      let submitEvent: any;
      form.on("submit", (e) => {
        submitEvent = e;
      });

      const error = new Error("Submit failed");
      await form.submit(async () => {
        throw error;
      });

      expect(submitEvent.status).toBe("error");
      expect(submitEvent.error).toBe(error);
    });

    test("should set submitError on failure", async () => {
      const form = new Form<TestFormFields>({
        defaultValues: { username: "john" },
      });

      const error = new Error("Submit failed");
      await form.submit(async () => {
        throw error;
      });

      expect(form.submitError).toBe(error);
    });

    test("should clear submitError on successful submit", async () => {
      const form = new Form<TestFormFields>({
        defaultValues: { username: "john" },
      });

      await form.submit(async () => {
        throw new Error("First error");
      });

      await form.submit(async () => {});

      expect(form.submitError).toBeUndefined();
    });
  });

  describe("reset", () => {
    test("should reset all fields to default values", () => {
      const form = new Form<TestFormFields>({
        defaultValues: {
          username: "john",
          email: "john@example.com",
        },
      });

      form.field("username").value = "jane";
      form.field("email").value = "jane@example.com";

      form.reset();

      expect(form.field("username").value).toBe("john");
      expect(form.field("email").value).toBe("john@example.com");
    });

    test("should reset to new default values when provided", () => {
      const form = new Form<TestFormFields>({
        defaultValues: { username: "john" },
      });

      form.field("username").value = "jane";
      form.reset({ username: "bob" });

      expect(form.field("username").value).toBe("bob");
      expect(form.field("username").defaultValue).toBe("bob");
    });

    test("should clear validation errors", async () => {
      const form = new Form<TestFormFields>({
        fields: { username: { required: true } },
      });

      await form.validate();
      form.reset();

      expect(form.validationErrors.username).toBeUndefined();
    });

    test("should clear submit error", async () => {
      const form = new Form<TestFormFields>({
        defaultValues: { username: "john" },
      });

      await form.submit(async () => {
        throw new Error("Submit failed");
      });

      form.reset();

      expect(form.submitError).toBeUndefined();
    });

    test("should emit change event when fields change", () => {
      const form = new Form<TestFormFields>({
        defaultValues: { username: "john" },
      });

      form.field("username").value = "jane";

      let changeEmitted = false;
      form.on("change", () => {
        changeEmitted = true;
      });

      form.reset();

      expect(changeEmitted).toBe(true);
    });

    test("should not emit change event when no fields change", () => {
      const form = new Form<TestFormFields>({
        defaultValues: { username: "john" },
      });

      let changeEmitted = false;
      form.on("change", () => {
        changeEmitted = true;
      });

      form.reset();

      expect(changeEmitted).toBe(false);
    });
  });

  describe("clear", () => {
    test("should set all field values to undefined", () => {
      const form = new Form<TestFormFields>({
        defaultValues: {
          username: "john",
          email: "john@example.com",
        },
      });

      form.clear();

      expect(form.field("username").value).toBeUndefined();
      expect(form.field("email").value).toBeUndefined();
    });

    test("should clear validation errors", async () => {
      const form = new Form<TestFormFields>({
        fields: { username: { required: true } },
      });

      await form.validate();
      form.clear();

      expect(form.validationErrors.username).toBeUndefined();
    });

    test("should clear submit error", async () => {
      const form = new Form<TestFormFields>({
        defaultValues: { username: "john" },
      });

      await form.submit(async () => {
        throw new Error("Submit failed");
      });

      form.clear();

      expect(form.submitError).toBeUndefined();
    });

    test("should emit change event when fields change", () => {
      const form = new Form<TestFormFields>({
        defaultValues: { username: "john" },
      });

      let changeEmitted = false;
      form.on("change", () => {
        changeEmitted = true;
      });

      form.clear();

      expect(changeEmitted).toBe(true);
    });
  });

  describe("toJSON", () => {
    test("should return all field values", () => {
      const form = new Form<TestFormFields>({
        defaultValues: {
          username: "john",
          email: "john@example.com",
          age: 30,
        },
      });

      const json = form.toJSON();

      expect(json).toEqual({
        username: "john",
        email: "john@example.com",
        age: 30,
      });
    });

    test("should include undefined values", () => {
      const form = new Form<TestFormFields>({});

      form.field("username");
      form.field("email");

      const json = form.toJSON();

      expect(json).toEqual({
        username: undefined,
        email: undefined,
      });
    });
  });

  describe("field change events", () => {
    test("should emit field-specific change event", () => {
      const form = new Form<TestFormFields>({
        defaultValues: { username: "john" },
      });

      let changeEvent: any;
      form.on("change:username", (e) => {
        changeEvent = e;
      });

      form.field("username").value = "jane";

      expect(changeEvent).toBeDefined();
      expect(changeEvent.prev).toBe("john");
      expect(changeEvent.value).toBe("jane");
    });

    test("should emit general change event when status is idle", () => {
      const form = new Form<TestFormFields>({
        defaultValues: { username: "john" },
      });

      let changeEmitted = false;
      form.on("change", () => {
        changeEmitted = true;
      });

      form.field("username").value = "jane";

      expect(changeEmitted).toBe(true);
    });

    test("should not emit general change event when status is not idle", () => {
      const form = new Form<TestFormFields>({
        defaultValues: { username: "john" },
      });

      let changeCount = 0;
      form.on("change", () => {
        changeCount++;
      });

      form.reset({ username: "jane" });

      // Should only emit once during reset, not for individual field changes
      expect(changeCount).toBe(1);
    });
  });

  describe("field validate events", () => {
    test("should emit field-specific validate event", async () => {
      const form = new Form<TestFormFields>({
        fields: { username: { required: true } },
      });

      let validateEvent: any;
      form.on("validate:username", (e) => {
        validateEvent = e;
      });

      await form.field("username").validate();

      expect(validateEvent).toBeDefined();
      expect(validateEvent.status).toBe("invalid");
    });

    test("should update validationErrors on field validation", async () => {
      const form = new Form<TestFormFields>({
        fields: { username: { required: true } },
      });

      await form.field("username").validate();

      expect(form.validationErrors.username).toBeDefined();
    });

    test("should remove validation errors when field becomes valid", async () => {
      const form = new Form<TestFormFields>({
        fields: { username: { required: true } },
      });

      await form.field("username").validate();
      form.field("username").value = "john";
      await form.field("username").validate();

      expect(form.validationErrors.username).toBeUndefined();
    });
  });

  describe("validationErrors getter", () => {
    test("should return copy of validation errors", async () => {
      const form = new Form<TestFormFields>({
        fields: { username: { required: true } },
      });

      await form.validate();

      const errors1 = form.validationErrors;
      const errors2 = form.validationErrors;

      expect(errors1).toEqual(errors2);
      expect(errors1).not.toBe(errors2);
    });
  });
});
