import {
	type Accessor,
	batch,
	createComputed,
	untrack,
	createUniqueId,
} from "solid-js";
import { createStore, unwrap } from "solid-js/store";
import { type ValidationEvent, createField, type Field } from "./field.js";
import { callOrReturn, toError } from "./util.js";
import type { Validation } from "./validation.js";

export type Status = "editing" | "submitting" | "validating" | "failed";

interface FormState<T> {
	values: Partial<T>;
	status: Status;
	dirty: boolean;
	fields: Partial<Record<keyof T, Field<unknown>>>;
	validationErrors: Partial<Record<keyof T, string[]>>;
	submitError?: Error | undefined;
}

export interface FormOptions<T> {
	id?: string;
	defaultValues: T | Accessor<T>;
	resetOnDefaultValueChange?: boolean | Accessor<boolean>;
	validationEvent?: ValidationEvent | Accessor<ValidationEvent>;
	submitOnError?: boolean | Accessor<boolean>;
	validations?:
		| Partial<Record<keyof T, Validation[]>>
		| Accessor<Partial<Record<keyof T, Validation[]>>>;
	submit?: (value: T) => Promise<void> | void;
}

export interface Form<T> {
	field<K extends keyof T>(name: K): Field<T[K]>;
	values: Accessor<Partial<T>>;
	submit(e?: Event): void;
	clear(): void;
	reset(): void;
	status: Accessor<Status>;
	validate(): Promise<boolean>;
	control<E extends HTMLElement>(el: E, accessor?: () => true): void;

	isSubmitting: Accessor<boolean>;
	isDirty: Accessor<boolean>;
	isValid: Accessor<boolean>;
	clearErrors(): void;
	submitError: Accessor<Error | undefined>;
}

export function createForm<T>(options: FormOptions<T>): Form<T> {
	const [store, mutate] = createStore<FormState<T>>({
		values: {},
		status: "editing",
		dirty: false,
		fields: {},
		validationErrors: {},
		submitError: void 0,
	});

	const id = options.id ?? createUniqueId();

	const isValid = () => {
		return !Object.values(store.validationErrors).some(
			(m) => (m as string[]).length,
		);
	};

	const reset = () => {
		const track = callOrReturn(options.resetOnDefaultValueChange ?? true, true);
		mutate((state) => ({
			...state,
			values: { ...(callOrReturn(options.defaultValues, track) ?? {}) },
			dirty: false,
			validationErrors: {},
			submitError: void 0,
			status: "editing",
		}));
	};

	createComputed(reset);

	const validate = async () => {
		const fields = unwrap(store.fields);
		for (const name in fields) {
			await untrack(() => store.fields[name])?.validate();
		}

		return untrack(isValid);
	};

	const _createField = <K extends keyof T>(name: K) => {
		return createField<K, T>(
			id,
			name,
			{
				setValue(value) {
					batch(() => {
						mutate("dirty", true);
						mutate("values", (values) => ({ ...values, [name]: value }));
						const vEvent = callOrReturn(options.validationEvent);

						if (vEvent === "submit") {
							mutate("validationErrors", (errors) => ({
								...errors,
								[name]: [],
							}));
						}
					});
				},
				value() {
					return store.values[name] as T[K] | undefined;
				},
				errors() {
					return store.validationErrors[name];
				},
				setErrors(errors) {
					mutate("validationErrors", (old) => ({ ...old, [name]: errors }));
				},
			},
			() => callOrReturn(options.validations)?.[name] ?? [],
			() => callOrReturn(options.validationEvent) ?? "submit",
		);
	};

	return {
		field<K extends keyof T>(name: K) {
			if (store.fields[name]) {
				return store.fields[name] as Field<T[K]>;
			}

			const field = _createField(name);
			mutate("fields", (fields) => ({ ...fields, [name]: field }));

			return field;
		},
		values() {
			return { ...store.values };
		},
		clear() {
			mutate((state) => ({
				...state,
				values: {},
				dirty: false,
				validationErrors: {},
				submitError: void 0,
				status: "editing",
			}));
		},
		reset: () => untrack(reset),
		validate,
		isSubmitting() {
			return store.status === "submitting";
		},
		isDirty() {
			return store.dirty;
		},
		status() {
			return store.status;
		},
		isValid,
		submitError() {
			return store.submitError;
		},
		clearErrors() {
			mutate((old) => ({
				...old,
				validationErrors: {},
				submitError: void 0,
				status: "editing",
			}));
		},
		control<E extends HTMLElement>(el: E) {
			const name = el.getAttribute("name") as keyof T;
			if (!name) {
				console.error("no name");
				return;
			}

			let field = untrack(() => store.fields[name]);

			if (!field) field = _createField(name);

			field?.control(el, () => true);
		},
		async submit(e?: Event) {
			e?.preventDefault();

			mutate("submitError", void 0);

			if (callOrReturn(options.validationEvent) === "submit") {
				await validate();
			}

			if (!callOrReturn(options.submitOnError) && !isValid()) {
				return;
			}

			mutate("status", "submitting");
			try {
				await Promise.resolve(options.submit?.(store.values as T));
				batch(() => {
					mutate("status", "editing");
					mutate("dirty", false);
				});
			} catch (e) {
				batch(() => {
					mutate("status", "failed");
					mutate("submitError", toError(e));
				});
			}
		},
	};
}
