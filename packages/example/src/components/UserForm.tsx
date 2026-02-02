import {
  createForm,
  createField,
  createFieldArray,
} from "@kildevaeld/solid-form2";
import { Show, For, createSignal } from "solid-js";
import "../styles/UserForm.css";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  bio: string;
  interests: string[];
}

export default function UserForm() {
  const [submitted, setSubmitted] = createSignal(false);
  const [formData, setFormData] = createSignal<User | null>(null);

  const form = createForm<User>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      age: 18,
      bio: "",
      interests: [],
    },
    onSubmit: async (values) => {
      setFormData(values);
      setSubmitted(true);
      console.log("Form submitted:", values);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
  });

  const firstNameField = createField(form, "firstName");
  const lastNameField = createField(form, "lastName");
  const emailField = createField(form, "email");
  const ageField = createField(form, "age");
  const bioField = createField(form, "bio");
  const interestsField = createFieldArray(form, "interests");

  const handleAddInterest = () => {
    const interest = prompt("Enter an interest:");
    if (interest) {
      interestsField.push(interest);
    }
  };

  const handleRemoveInterest = (index: number) => {
    interestsField.remove(index);
  };

  return (
    <div class="user-form-container">
      <form onSubmit={form.handleSubmit}>
        <div class="form-section">
          <h3>Personal Information</h3>

          <div class="form-group">
            <label for="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              placeholder="John"
              value={firstNameField.value() ?? ""}
              onChange={(e) => firstNameField.setValue(e.currentTarget.value)}
              onBlur={() => firstNameField.validate()}
              class="form-input"
            />
            <Show when={firstNameField.error()}>
              <p class="error">{firstNameField.error()}</p>
            </Show>
          </div>

          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              placeholder="Doe"
              value={lastNameField.value() ?? ""}
              onChange={(e) => lastNameField.setValue(e.currentTarget.value)}
              onBlur={() => lastNameField.validate()}
              class="form-input"
            />
            <Show when={lastNameField.error()}>
              <p class="error">{lastNameField.error()}</p>
            </Show>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={emailField.value() ?? ""}
              onChange={(e) => emailField.setValue(e.currentTarget.value)}
              onBlur={() => emailField.validate()}
              class="form-input"
            />
            <Show when={emailField.error()}>
              <p class="error">{emailField.error()}</p>
            </Show>
          </div>

          <div class="form-group">
            <label for="age">Age</label>
            <input
              id="age"
              type="number"
              placeholder="18"
              value={ageField.value() ?? ""}
              onChange={(e) =>
                ageField.setValue(parseInt(e.currentTarget.value))
              }
              onBlur={() => ageField.validate()}
              class="form-input"
            />
            <Show when={ageField.error()}>
              <p class="error">{ageField.error()}</p>
            </Show>
          </div>

          <div class="form-group">
            <label for="bio">Bio</label>
            <textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={bioField.value() ?? ""}
              onChange={(e) => bioField.setValue(e.currentTarget.value)}
              class="form-textarea"
            />
            <Show when={bioField.error()}>
              <p class="error">{bioField.error()}</p>
            </Show>
          </div>
        </div>

        <div class="form-section">
          <h3>Interests</h3>
          <div class="interests-list">
            <For each={interestsField.value()}>
              {(interest, index) => (
                <div class="interest-item">
                  <span>{interest}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(index())}
                    class="remove-btn"
                  >
                    ✕
                  </button>
                </div>
              )}
            </For>
          </div>
          <button
            type="button"
            onClick={handleAddInterest}
            class="btn btn-secondary"
          >
            Add Interest
          </button>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            disabled={form.isSubmitting()}
            class="btn btn-primary"
          >
            {form.isSubmitting() ? "Submitting..." : "Submit"}
          </button>
          <button
            type="button"
            onClick={() => form.reset()}
            class="btn btn-secondary"
          >
            Reset
          </button>
        </div>

        <Show when={form.error()}>
          <div class="form-error">
            <p>{form.error()}</p>
          </div>
        </Show>
      </form>

      <Show when={submitted() && formData()}>
        <div class="success-message">
          <h4>Form submitted successfully!</h4>
          <pre>{JSON.stringify(formData(), null, 2)}</pre>
        </div>
      </Show>
    </div>
  );
}
