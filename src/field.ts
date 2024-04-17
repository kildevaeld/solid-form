import { batch, untrack, type Accessor } from "solid-js";
import type { Validation } from "./validation.js";
import { createControl } from "./control.js";

export type ValidationEvent = "input" | "blur" | "submit";

export interface Channel<K extends keyof T, T> {
	value: () => T[K] | undefined;
	setValue: (value: T[K] | undefined) => void;
	errors: () => string[] | undefined;
	setErrors: (errors: string[]) => void;
}

export interface Field<T> {
	value: Accessor<T | undefined>;
	setValue(value?: T): void;
	touch(): void;
	errors(): string[] | undefined;
	control<E extends HTMLElement>(el: E, accessor?: () => true): void;
	validate(): Promise<boolean>;
}

export function createField<K extends keyof T, T>(
	name: K,
	channel: Channel<K, T>,
	validations: Accessor<Validation[]>,
	validationEvent: Accessor<ValidationEvent>,
): Field<T[K]> {
	const validate = async () => {
		const value = untrack(channel.value);

		const result = await Promise.all(
			validations().map(async (m) => {
				if (await Promise.resolve(m.validate(value))) {
					return null;
				}
				return typeof m.message === "function"
					? m.message(name as string)
					: m.message;
			}),
		);

		const errors = result.filter(Boolean) as string[];

		channel.setErrors(errors);

		return !!errors.length;
	};

	const setValue = (value: T[K] | undefined) => {
		const event = validationEvent();

		if (event === "input") {
			const oldValue = untrack(channel.value);
			if (oldValue === value) {
				return;
			}
		}
		batch(() => {
			channel.setValue(value);
			if (event === "input") {
				validate();
			}
		});
	};

	const touch = () => {
		const event = validationEvent();
		if (event === "blur") {
			validate();
		}
	};

	return {
		value: () => channel.value(),
		setValue,
		touch,
		errors: channel.errors,
		validate,
		control: createControl(channel.value, setValue, touch),
	};
}
