import { createForm, min, max } from "@kildevaeld/solid-form2";
import { Show, For, createSignal, createEffect, untrack } from "solid-js";
import "../styles/UserForm.css";
import { Collection } from "@kildevaeld/model";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  bio: string;
  interests: Collection<string>;
}

export default function UserForm() {
  const [submitted, setSubmitted] = createSignal(false);
  const [formData, setFormData] = createSignal<User | null>(null);

  const form = createForm<User>({
    defaultValues: () => ({
      firstName: "",
      lastName: "",
      email: "",
      age: 22,
      bio: "",
      interests: new Collection<string>(),
    }),
    validationMode: "submit",
    fields: {
      age: {
        validations: [min(18), max(99)],
      },
      firstName: {
        required: true,
      },
      interests: {},
    },
    submit: async (values) => {
      setFormData(values);
      setSubmitted(true);
      console.log("Form submitted:", values);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
  });

  // createEffect(() => {
  //   console.log(form.values())
  //   form.field('age').validate();
  //   console.log(untrack(form.field('age').errors))
  // })

  const handleAddInterest = () => {
    const interest = prompt("Enter an interest:");
    if (interest) {
      form.field("interests").value().push(interest);
    }
  };

  const handleRemoveInterest = (index: number) => {
    form.field("interests").value().remove(index);
  };

  return (
    <div class="user-form-container">
      <form onSubmit={form.submit}>
        <div class="form-section">
          <h3>Personal Information</h3>

          <div class="form-group">
            <label for="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              placeholder="John"
              ref={form.field("firstName").control}
              class="form-input"
            />
            <For each={form.field("firstName").errors()}>
              {(e) => {
                return <p class="error">{e.message}</p>;
              }}
            </For>
          </div>

          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              placeholder="Doe"
              ref={form.field("lastName").control}
              class="form-input"
            />
            {/* <Show when={lastNameField.error()}>
              <p class="error">{lastNameField.error()}</p>
            </Show> */}
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="john@example.com"
              ref={form.field("email").control}
              class="form-input"
            />
            {/* <Show when={emailField.error()}>
              <p class="error">{emailField.error()}</p>
            </Show> */}
          </div>

          <div class="form-group">
            <label for="age">Age</label>
            <input
              id="age"
              type="number"
              placeholder="18"
              // value={ageField.value() ?? ""}
              // onChange={(e) =>
              //   ageField.setValue(parseInt(e.currentTarget.value))
              // }
              // onBlur={() => ageField.validate()}
              ref={form.field("age").control}
              class="form-input"
            />
            <For each={form.field("age").errors()}>
              {(e) => {
                return <p class="error">{e.message}</p>;
              }}
            </For>
          </div>

          {/* <div class="form-group">
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
          </div> */}
        </div>

        <div class="form-section">
          <h3>Interests</h3>
          <div class="interests-list">
            <For each={[...form.field("interests").value()]}>
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

        {/* <Show when={form.error()}>
          <div class="form-error">
            <p>{form.error()}</p>
          </div>
        </Show> */}
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
