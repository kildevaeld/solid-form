import { describe, test, expect, vi } from "vitest";
import { createRoot, createSignal, createEffect } from "solid-js";
import { createForm } from "./form";

interface TestFormFields {
  username: string;
  email: string;
  age: number;
}

describe("createForm", () => {
  test("should initialize with default values", () => {
    createRoot((dispose) => {
      const [defaultValues] = createSignal<Partial<TestFormFields>>({
        username: "john",
        email: "john@example.com",
      });

      const form = createForm<TestFormFields>({
        defaultValues,
      });

      expect(form.values()).toEqual({
        username: "john",
        email: "john@example.com",
      });

      dispose();
    });
  });

  test("should create fields on demand", () => {
    createRoot((dispose) => {
      const form = createForm<TestFormFields>({});

      const usernameField = form.field("username");
      expect(usernameField).toBeDefined();
      expect(usernameField.value()).toBeUndefined();

      dispose();
    });
  });

  test("should track form validity", () => {
    createRoot((dispose) => {
      const form = createForm<TestFormFields>({
        fields: {
          username: { required: true },
        },
      });

      // Check validity in reactive context
      let valid: boolean = true;
      createEffect(() => {
        valid = form.valid();
      });

      // Initially invalid because username is required but empty
      expect(valid).toBe(false);

      // Set a value
      form.field("username").setValue("testuser");

      // Check again with fresh effect
      let validAfter: boolean = false;
      createEffect(() => {
        validAfter = form.valid();
      });

      // Should be valid now
      expect(validAfter).toBe(true);

      dispose();
    });
  });

  test("should track form dirty state", () => {
    createRoot((dispose) => {
      const [defaultValues] = createSignal<Partial<TestFormFields>>({
        username: "john",
      });

      const form = createForm<TestFormFields>({
        defaultValues,
      });

      // Initially not dirty
      expect(form.dirty()).toBe(false);

      // Change value
      form.field("username").setValue("jane");

      // Should be dirty now
      expect(form.dirty()).toBe(true);

      dispose();
    });
  });

  test("should reset form to default values", () => {
    createRoot((dispose) => {
      const [defaultValues] = createSignal<Partial<TestFormFields>>({
        username: "john",
      });

      const form = createForm<TestFormFields>({
        defaultValues,
      });

      // Change value
      form.field("username").setValue("jane");
      expect(form.values().username).toBe("jane");

      // Reset
      form.reset();
      expect(form.values().username).toBe("john");
      expect(form.dirty()).toBe(false);

      dispose();
    });
  });

  test("should handle form submission", async () => {
    createRoot(async (dispose) => {
      const submitHandler = vi.fn();

      const form = createForm<TestFormFields>({
        submit: submitHandler,
      });

      // Set values
      form.field("username").setValue("testuser");
      form.field("email").setValue("test@example.com");

      // Create a mock event
      const event = new Event("submit", { cancelable: true }) as SubmitEvent;
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      await form.submit(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(submitHandler).toHaveBeenCalledWith({
        username: "testuser",
        email: "test@example.com",
      });

      dispose();
    });
  });

  test("should validate on submit when validationMode is submit", async () => {
    createRoot(async (dispose) => {
      const submitHandler = vi.fn();

      const form = createForm<TestFormFields>({
        fields: {
          username: { required: true },
        },
        submit: submitHandler,
        validationMode: "submit",
      });

      // Create a mock event
      const event = new Event("submit", { cancelable: true }) as SubmitEvent;

      // Submit without setting required field
      await form.submit(event);

      // Should not call submit handler because validation failed
      expect(submitHandler).not.toHaveBeenCalled();

      // Set required field
      form.field("username").setValue("testuser");

      // Submit again
      await form.submit(event);

      // Should call submit handler now
      expect(submitHandler).toHaveBeenCalledWith({
        username: "testuser",
      });

      dispose();
    });
  });

  test("should track submission status", () => {
    createRoot((dispose) => {
      const form = createForm<TestFormFields>({
        submit: async () => {
          // Simulate async operation
          await new Promise((resolve) => setTimeout(resolve, 10));
        },
      });

      expect(form.isSubmitting()).toBe(false);
      expect(form.status()).toBe("idle");

      dispose();
    });
  });

  test("should validate form programmatically", async () => {
    createRoot(async (dispose) => {
      const form = createForm<TestFormFields>({
        fields: {
          username: { required: true },
          email: { required: true },
        },
      });

      const isValid = await form.validate();
      expect(isValid).toBe(false);

      form.field("username").setValue("testuser");
      form.field("email").setValue("test@example.com");

      const isValidNow = await form.validate();
      expect(isValidNow).toBe(true);

      dispose();
    });
  });

  test("should reuse field instances", () => {
    createRoot((dispose) => {
      const form = createForm<TestFormFields>({});

      const field1 = form.field("username");
      const field2 = form.field("username");

      expect(field1).toBe(field2);

      dispose();
    });
  });

  test("should handle reactive default values", () => {
    createRoot((dispose) => {
      const [defaultValues, setDefaultValues] = createSignal<
        Partial<TestFormFields>
      >({
        username: "initial",
      });

      const form = createForm<TestFormFields>({
        defaultValues,
      });

      expect(form.values().username).toBe("initial");

      dispose();
    });
  });
});
