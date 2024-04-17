export interface Validation {
	name: string;
	message: string | ((name: string) => string);
	init?: (el: HTMLElement) => void;
	validate(value: unknown): Promise<boolean> | boolean;
}

export function required(
	msg?: ((name?: string) => string) | string,
): Validation {
	return {
		name: "required",
		message:
			msg ??
			((name?: string) => (name ? `${name} is required` : "field is required")),
		init: (el) => {
			if (el instanceof HTMLInputElement) {
				el.required = true;
			}
		},
		validate(value) {
			return !!value;
		},
	};
}

function getNumber(value: unknown): number {
	if (value == null || value === undefined) {
		return 0;
	}
	if (typeof value === "string") {
		return value.length;
	}
	if (typeof value === "number") {
		return value;
	}
	if (Array.isArray(value)) {
		return value.length;
	}
	if (value instanceof Blob) {
		return value.size;
	}
	return Object.keys(value).length;
}

export function min(
	min: number,
	msg?: ((name?: string) => string) | string,
): Validation {
	return {
		name: "minimum length",
		message:
			msg ??
			((name?: string) =>
				name ? `${name} should be at least ${min}` : "field is required"),
		validate: (v) => getNumber(v) >= min,
	};
}

export function max(
	max: number,
	msg?: ((name?: string) => string) | string,
): Validation {
	return {
		name: "maximum length",
		message:
			msg ??
			((name?: string) => (name ? `${name} is to large` : "field is required")),
		validate: (v) => getNumber(v) <= max,
	};
}

export function pattern(
	pattern: RegExp,
	msg?: ((name?: string) => string) | string,
): Validation {
	return {
		name: "pattern",
		message:
			msg ??
			((name?: string) =>
				name
					? `${name} does not match pattern`
					: "field does not match pattern"),
		validate: (v) => pattern.test(`${v}`),
	};
}
