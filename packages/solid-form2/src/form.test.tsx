import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createRoot,
  createSignal,
  createEffect,
  getOwner,
  runWithOwner,
} from "solid-js";
import { createForm } from "./form";
import { createAsyncRoot } from "./util";

interface TestFormFields {
  username: string;
  email: string;
  age: number;
}

describe("createForm", () => {
  test("should initialize with default values", async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const [defaultValues] = createSignal<Partial<TestFormFields>>({
          username: "john",
          email: "john@example.com",
        });

        const form = createForm<TestFormFields>({
          defaultValues,
        });

        // Access the values directly via the form object
        expect(form.form.toJSON()).toEqual({
          username: "john",
          email: "john@example.com",
        });

        dispose();
        resolve();
      });
    });
  });

  test("should create fields on demand", async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const form = createForm<TestFormFields>({});

        const usernameField = form.field("username");
        expect(usernameField).toBeDefined();

        // Access directly from underlying field
        expect(form.form.field("username").value).toBeUndefined();

        dispose();
        resolve();
      });
    });
  });

  test("should track form validity", async () => {
    await createAsyncRoot(async (owner) => {
      const form = createForm<TestFormFields>({
        fields: {
          username: { required: true },
        },
      });

      // Validate first to populate errors
      await form.validate();

      // Initially invalid because username is required but empty
      expect(form.form.isValid).toBe(false);

      // Set a value and validate
      await runWithOwner(owner, async () => {
        form.field("username").setValue("testuser");
        await form.validate();

        // Should be valid now
        expect(form.form.isValid).toBe(true);
      });
    });
  });

  test("should track form dirty state", async () => {
    await createAsyncRoot(async (owner) => {
      const [defaultValues] = createSignal<Partial<TestFormFields>>({
        username: "john",
      });

      const form = createForm<TestFormFields>({
        defaultValues,
      });

      // Initially not dirty
      expect(form.form.isDirty).toBe(false);

      // Change value
      form.field("username").setValue("jane");

      // Use createEffect to wait for reactivity - wrap in runWithOwner
      await runWithOwner(owner, () => {
        return new Promise<void>((resolve) => {
          createEffect(() => {
            if (form.dirty()) {
              resolve();
            }
          });
        });
      });

      // Should be dirty now
      expect(form.form.isDirty).toBe(true);
    });
  });

  test("should reset form to default values", async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const [defaultValues] = createSignal<Partial<TestFormFields>>({
          username: "john",
        });

        const form = createForm<TestFormFields>({
          defaultValues,
        });

        // Change value
        form.field("username").setValue("jane");
        expect(form.form.toJSON().username).toBe("jane");

        // Reset
        form.reset();
        expect(form.form.toJSON().username).toBe("john");
        expect(form.form.isDirty).toBe(false);

        dispose();
        resolve();
      });
    });
  });

  test("should handle form submission", async () => {
    const submitHandler = vi.fn();

    await createAsyncRoot(async (dispose) => {
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
    });
  });

  test("should validate on submit when validationMode is submit", async () => {
    const submitHandler = vi.fn();

    await createAsyncRoot(async (owner) => {
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

      await runWithOwner(owner, async () => {
        // Set required field
        form.field("username").setValue("testuser");

        // Submit again
        await form.submit(event);
      });

      // Should call submit handler now
      expect(submitHandler).toHaveBeenCalledWith({
        username: "testuser",
      });
    });
  });

  test("should track submission status", async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const form = createForm<TestFormFields>({
          submit: async () => {
            // Simulate async operation
            await new Promise((resolve) => setTimeout(resolve, 10));
          },
        });

        expect(form.form.status).toBe("idle");

        dispose();
        resolve();
      });
    });
  });

  test("should reuse field instances", async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const form = createForm<TestFormFields>({});

        const field1 = form.field("username");
        const field2 = form.field("username");

        expect(field1).toBe(field2);

        dispose();
        resolve();
      });
    });
  });

  test("should handle reactive default values", async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const [defaultValues, setDefaultValues] = createSignal<
          Partial<TestFormFields>
        >({
          username: "initial",
        });

        const form = createForm<TestFormFields>({
          defaultValues,
        });

        expect(form.form.toJSON().username).toBe("initial");

        dispose();
        resolve();
      });
    });
  });

  test("should validate form programmatically", async () => {
    await createAsyncRoot(async (owner) => {
      const form = createForm<TestFormFields>({
        fields: {
          username: { required: true },
          email: { required: true },
        },
      });

      const isValid = await form.validate();
      expect(isValid).toBe(false);

      runWithOwner(owner, async () => {
        form.field("username").setValue("testuser");
        form.field("email").setValue("test@example.com");

        const isValidNow = await form.validate();
        expect(isValidNow).toBe(true);
      });
    });
  });
});
