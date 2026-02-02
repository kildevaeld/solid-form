import {
  createForm,
  createField,
  createFieldArray,
} from "@kildevaeld/solid-form2";
import { Show, For } from "solid-js";
import UserForm from "./components/UserForm";
import "./App.css";

export default function App() {
  return (
    <div class="app">
      <header>
        <h1>@kildevaeld/solid-form2 Example</h1>
        <p>A modern form management library for Solid.js</p>
      </header>

      <main>
        <section class="showcase">
          <h2>User Registration Form</h2>
          <UserForm />
        </section>
      </main>
    </div>
  );
}
