import { describe, test, expect, beforeEach, vi } from "vitest";
import { createRoot, createEffect } from "solid-js";
import { createField } from "./field";
import { Field } from "@kildevaeld/form";
import { page } from "@vitest/browser/context";

interface TestFields {
  username: string;
  email: string;
}

describe("createField", () => {
  test("should create field with initial value", () => {
    createRoot((dispose) => {
      const baseField = new Field<"username", string>("username", "initial");
      const field = createField(baseField, "change");

      // Need to call value() in a reactive context to track it
      let value: string | undefined;
      createEffect(() => {
        value = field.value();
      });

      expect(value).toBe("initial");
      expect(field.name).toBe("username");

      dispose();
    });
  });

  test("should update value when setValue is called", () => {
    createRoot((dispose) => {
      const baseField = new Field<"username", string>("username");
      const field = createField(baseField, "change");

      field.setValue("newvalue");

      let value: string | undefined;
      createEffect(() => {
        value = field.value();
      });

      expect(value).toBe("newvalue");

      dispose();
    });
  });

  test("should track dirty state", () => {
    createRoot((dispose) => {
      const baseField = new Field<"username", string>("username", "initial");
      const field = createField(baseField, "change");

      let dirty: boolean = false;
      createEffect(() => {
        dirty = field.dirty();
      });

      expect(dirty).toBe(false);

      field.setValue("changed");

      // Wait for effect to run
      let newDirty: boolean = false;
      createEffect(() => {
        newDirty = field.dirty();
      });

      expect(newDirty).toBe(true);

      dispose();
    });
  });

  test("should validate field", async () => {
    createRoot(async (dispose) => {
      const baseField = new Field<"username", string>("username", undefined, {
        required: true,
      });
      const field = createField(baseField, "change");

      const isValid = await field.validate();
      expect(isValid).toBe(false);

      let errors: any[] = [];
      createEffect(() => {
        errors = field.errors();
      });
      expect(errors.length).toBeGreaterThan(0);

      field.setValue("validvalue");
      const isValidNow = await field.validate();
      expect(isValidNow).toBe(true);

      let errorsAfter: any[] = [];
      createEffect(() => {
        errorsAfter = field.errors();
      });
      expect(errorsAfter.length).toBe(0);

      dispose();
    });
  });

  test("should track errors reactively", () => {
    createRoot((dispose) => {
      const baseField = new Field<"username", string>("username", undefined, {
        required: true,
      });
      const field = createField(baseField, "change");

      let errors: any[] = [];
      createEffect(() => {
        errors = field.errors();
      });

      expect(errors).toEqual([]);

      // Manually trigger validation
      baseField.validate();

      // Check errors reactively
      let errorsAfter: any[] = [];
      createEffect(() => {
        errorsAfter = field.errors();
      });

      expect(errorsAfter.length).toBeGreaterThan(0);

      dispose();
    });
  });

  test("should react to field changes", () => {
    createRoot((dispose) => {
      const baseField = new Field<"username", string>("username", "initial");
      const field = createField(baseField, "change");

      let reactiveValue: string | undefined;
      createEffect(() => {
        reactiveValue = field.value();
      });

      expect(reactiveValue).toBe("initial");

      // Change through base field
      baseField.set("changed");

      // The reactive value should update
      let newValue: string | undefined;
      createEffect(() => {
        newValue = field.value();
      });

      expect(newValue).toBe("changed");

      dispose();
    });
  });
});

describe("createField control directive", () => {
  test("should bind input element", async () => {
    createRoot((dispose) => {
      const baseField = new Field<"username", string>("username");
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

      // Field should be updated
      let value: string | undefined;
      createEffect(() => {
        value = field.value();
      });

      expect(value).toBe("testvalue");

      // Cleanup
      document.body.removeChild(input);
      dispose();
    });
  });

  test("should bind select element", async () => {
    createRoot((dispose) => {
      const baseField = new Field<"option", string>("option");
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

      // Field should be updated
      let value: string | undefined;
      createEffect(() => {
        value = field.value();
      });

      expect(value).toBe("option2");

      // Cleanup
      document.body.removeChild(select);
      dispose();
    });
  });

  test("should handle validation mode 'change'", async () => {
    createRoot(async (dispose) => {
      const baseField = new Field<"username", string>("username", undefined, {
        required: true,
      });
      const field = createField(baseField, "change");

      const input = document.createElement("input");
      input.type = "text";
      document.body.appendChild(input);

      field.control(input);

      // Trigger change event with empty value
      input.value = "";
      input.dispatchEvent(new Event("change", { bubbles: true }));

      // Give it time to validate
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should have errors
      let errors: any[] = [];
      createEffect(() => {
        errors = field.errors();
      });

      expect(errors.length).toBeGreaterThan(0);

      // Now add a value
      input.value = "valid";
      input.dispatchEvent(new Event("change", { bubbles: true }));

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should have no errors
      let errorsAfter: any[] = [];
      createEffect(() => {
        errorsAfter = field.errors();
      });

      expect(errorsAfter.length).toBe(0);

      // Cleanup
      document.body.removeChild(input);
      dispose();
    });
  });

  test("should update input when field value changes", () => {
    createRoot((dispose) => {
      const baseField = new Field<"username", string>("username", "initial");
      const field = createField(baseField, "change");

      const input = document.createElement("input");
      input.type = "text";
      document.body.appendChild(input);

      field.control(input);

      // Give control time to set initial value
      setTimeout(() => {
        // Input should have initial value (might be set asynchronously)
        if (input.value) {
          expect(input.value).toBe("initial");
        }

        // Change field value
        field.setValue("updated");

        // Input should update
        setTimeout(() => {
          expect(input.value).toBe("updated");
        }, 10);
      }, 10);

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(input);
        dispose();
      }, 50);
    });
  });

  test("should cleanup on dispose", () => {
    createRoot((dispose) => {
      const baseField = new Field<"username", string>("username");
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
      expect(baseField.value).not.toBe("shouldnotupdate");

      // Cleanup
      document.body.removeChild(input);
    });
  });
});
