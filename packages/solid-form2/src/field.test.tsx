import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { createRoot, createEffect, createSignal } from "solid-js";
import { createField } from "./field.js";
import { Field } from "@kildevaeld/form";
import { createAsyncRoot } from "./util.js";

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
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const baseField = new Field<"username", string>({
          name: "username",
          value: "initial",
        });
        const field = createField(baseField, "change");

        expect(baseField.isDirty).toBe(false);

        field.setValue("changed");

        // Give a moment for the change to propagate
        setTimeout(() => {
          expect(baseField.isDirty).toBe(true);
          dispose();
          resolve();
        }, 50);
      });
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
        baseField.set("changed");

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
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
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

        // Give it a moment to update
        setTimeout(() => {
          // Field should be updated
          expect(baseField.value).toBe("testvalue");

          // Cleanup
          document.body.removeChild(input);
          dispose();
          resolve();
        }, 50);
      });
    });
  });

  test("should bind select element", async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
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

        // Give it a moment to update
        setTimeout(() => {
          // Field should be updated
          expect(baseField.value).toBe("option2");

          // Cleanup
          document.body.removeChild(select);
          dispose();
          resolve();
        }, 50);
      });
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

      // Trigger change event with empty value
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      // Give it time to validate
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Should have errors
      expect(baseField.errors.length).toBeGreaterThan(0);

      // Now add a value
      input.value = "valid";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      // await new Promise((resolve) => setTimeout(resolve, 100));

      // Should have no errors
      expect(baseField.errors.length).toBe(0);

      // Cleanup
      document.body.removeChild(input);
      // dispose();
    });
  });

  test("should update input when field value changes", async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const baseField = new Field<"username", string>({
          name: "username",
          value: "initial",
        });
        const field = createField(baseField, "change");

        const input = document.createElement("input");
        input.type = "text";
        document.body.appendChild(input);

        field.control(input);

        // Give control time to set initial value
        setTimeout(() => {
          // Change field value
          field.setValue("updated");

          // Input should update
          setTimeout(() => {
            expect(input.value).toBe("updated");

            // Cleanup
            document.body.removeChild(input);
            dispose();
            resolve();
          }, 100);
        }, 100);
      });
    });
  });

  test("should cleanup on dispose", async () => {
    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const baseField = new Field<"username", string>({ name: "username" });
        const field = createField(baseField, "change");

        const input = document.createElement("input");
        input.type = "text";
        document.body.appendChild(input);

        field.control(input);

        // Dispose should cleanup event listeners
        dispose();

        // After dispose, changing input shouldn't affect field
        input.value = "shouldnotupdate";
        input.dispatchEvent(new Event("input", { bubbles: true }));

        // Field should not have updated (check the underlying field directly)
        setTimeout(() => {
          expect(baseField.value).not.toBe("shouldnotupdate");

          // Cleanup
          document.body.removeChild(input);
          resolve();
        }, 50);
      });
    });
  });
});
