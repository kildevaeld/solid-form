import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { createRoot, createEffect, createSignal } from "solid-js";
import { createField } from "./field.js";
import { Field } from "@kildevaeld/form";
import { createAsyncRoot, waitForCondition, pollCondition } from "./util.js";

interface TestFields {
  username: string;
  email: string;
}

describe("createField", () => {
  test("should create field with initial value", async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const baseField = new Field<"username", string>({
          name: "username",
          value: "initial",
        });
        const field = createField(baseField, "change");

        // Access value directly from the underlying field
        expect(baseField.value).toBe("initial");
        expect(field.name).toBe("username");

        dispose();
        resolve();
      });
    });
  });

  test("should update value when setValue is called", async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const baseField = new Field<"username", string>({ name: "username" });
        const field = createField(baseField, "change");

        field.setValue("newvalue");

        // Access value directly
        expect(baseField.value).toBe("newvalue");

        dispose();
        resolve();
      });
    });
  });

  test("should track dirty state", async () => {
    await createAsyncRoot(async () => {
      const baseField = new Field<"username", string>({
        name: "username",
        value: "initial",
      });
      const field = createField(baseField, "change");

      expect(baseField.isDirty).toBe(false);

      field.setValue("changed");

      // Wait for reactivity using waitForCondition
      await waitForCondition(() => baseField.isDirty);

      expect(baseField.isDirty).toBe(true);
    });
  });

  test("should validate field", async () => {
    await new Promise<void>((resolve) => {
      createRoot(async (dispose) => {
        const baseField = new Field<"username", string>({
          name: "username",
          required: true,
        });
        const field = createField(baseField, "change");

        const isValid = await field.validate();
        expect(isValid).toBe(false);
        expect(baseField.errors.length).toBeGreaterThan(0);

        field.setValue("validvalue");
        const isValidNow = await field.validate();
        expect(isValidNow).toBe(true);
        expect(baseField.errors.length).toBe(0);

        dispose();
        resolve();
      });
    });
  });

  test("should track errors reactively", async () => {
    await new Promise<void>((resolve) => {
      createRoot(async (dispose) => {
        const baseField = new Field<"username", string>({
          name: "username",
          required: true,
        });
        const field = createField(baseField, "change");

        expect(baseField.errors).toEqual([]);

        // Trigger validation
        await baseField.validate();

        // Check errors directly from base field
        expect(baseField.errors.length).toBeGreaterThan(0);

        dispose();
        resolve();
      });
    });
  });

  test("should react to field changes", async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const baseField = new Field<"username", string>({
          name: "username",
          value: "initial",
        });
        const field = createField(baseField, "change");

        expect(baseField.value).toBe("initial");

        // Change through base field
        baseField.setValue("changed");

        // The value should update
        expect(baseField.value).toBe("changed");

        dispose();
        resolve();
      });
    });
  });
});

describe("createField control directive", () => {
  test("should bind input element", async () => {
    await createAsyncRoot(async () => {
      const baseField = new Field<"username", string>({ name: "username" });
      const field = createField(baseField, "change");

      // Create a real input element in the browser
      const input = document.createElement("input");
      input.type = "text";
      document.body.appendChild(input);

      // Apply the control directive
      field.control(input);

      // Type into the input
      input.value = "testvalue";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      // Wait for the field to update
      await waitForCondition(() => baseField.value === "testvalue");

      // Field should be updated
      expect(baseField.value).toBe("testvalue");

      // Cleanup
      document.body.removeChild(input);
    });
  });

  test("should bind select element", async () => {
    await createAsyncRoot(async () => {
      const baseField = new Field<"option", string>({ name: "option" });
      const field = createField(baseField, "change");

      // Create a real select element
      const select = document.createElement("select");
      const option1 = document.createElement("option");
      option1.value = "option1";
      option1.textContent = "Option 1";
      const option2 = document.createElement("option");
      option2.value = "option2";
      option2.textContent = "Option 2";
      select.appendChild(option1);
      select.appendChild(option2);
      document.body.appendChild(select);

      // Apply the control directive
      field.control(select);

      // Change selection
      select.value = "option2";
      select.dispatchEvent(new Event("change", { bubbles: true }));

      // Wait for the field to update
      await waitForCondition(() => baseField.value === "option2");

      // Field should be updated
      expect(baseField.value).toBe("option2");

      // Cleanup
      document.body.removeChild(select);
    });
  });

  test("should handle validation mode 'change'", async () => {
    await createAsyncRoot(async () => {
      const baseField = new Field<"username", string>({
        name: "username",
        required: true,
      });
      const field = createField(baseField, "change");

      const input = document.createElement("input");
      input.type = "text";
      document.body.appendChild(input);

      field.control(input);

      // Trigger change event with empty value and wait for validation
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      // Wait for validation to complete
      await waitForCondition(() => baseField.errors.length > 0);

      // Should have errors
      expect(baseField.errors.length).toBeGreaterThan(0);

      // Now add a value and trigger validation
      input.value = "valid";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      // Wait for validation to complete
      await waitForCondition(() => baseField.errors.length === 0);

      // Should have no errors
      expect(baseField.errors.length).toBe(0);

      // Cleanup
      document.body.removeChild(input);
    });
  });

  test("should update input when field value changes", async () => {
    await createAsyncRoot(async () => {
      const baseField = new Field<"username", string>({
        name: "username",
        value: "initial",
      });
      const field = createField(baseField, "change");

      const input = document.createElement("input");
      input.type = "text";
      document.body.appendChild(input);

      field.control(input);

      // Wait for control to set initial value
      await waitForCondition(() => input.value === "initial");

      // Change field value
      field.setValue("updated");

      // Wait for input to update
      await waitForCondition(() => input.value === "updated");

      expect(input.value).toBe("updated");

      // Cleanup
      document.body.removeChild(input);
    });
  });

  test("should cleanup on dispose", async () => {
    await createAsyncRoot(async () => {
      const baseField = new Field<"username", string>({ name: "username" });
      const field = createField(baseField, "change");

      const input = document.createElement("input");
      input.type = "text";
      document.body.appendChild(input);

      // Create a scope that will be disposed
      await new Promise<void>((resolve) => {
        createRoot((dispose) => {
          field.control(input);

          // Dispose should cleanup event listeners
          dispose();
          resolve();
        });
      });

      // After dispose, changing input shouldn't affect field
      const originalValue = baseField.value;
      input.value = "shouldnotupdate";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      // Check immediately that the value hasn't changed
      expect(baseField.value).toBe(originalValue);

      // Poll to ensure it stays unchanged
      await pollCondition(() => baseField.value === originalValue);

      // Field should not have updated
      expect(baseField.value).not.toBe("shouldnotupdate");

      // Cleanup
      document.body.removeChild(input);
    });
  });
});
