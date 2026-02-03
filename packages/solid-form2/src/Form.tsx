import {
  createContext,
  splitProps,
  useContext,
  type ParentProps,
} from "solid-js";
import { type JSX } from "solid-js/h/jsx-runtime";
import { type Form } from "./form";
import { type FormFields } from "@kildevaeld/form";

export interface FormProps<
  T extends FormFields,
> extends JSX.FormHTMLAttributes<HTMLFormElement> {
  api: Form<T>;
}

const FORM_CONTEXT = createContext<Form<any>>();

export function useFormContext<T extends FormFields>(): Form<T> | undefined {
  return useContext(FORM_CONTEXT);
}

export function Form<T extends FormFields>(props: ParentProps<FormProps<T>>) {
  const [local, rest] = splitProps(props, ["api", "children"]);
  return (
    <form onSubmit={local.api.submit} {...(rest as any)}>
      <FORM_CONTEXT.Provider value={local.api}>
        {local.children}
      </FORM_CONTEXT.Provider>
    </form>
  );
}
