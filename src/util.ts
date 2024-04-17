import { untrack } from "solid-js";

export function getValue<T extends HTMLElement>(el: T) {
	if (el instanceof HTMLInputElement) {
		switch (el.type) {
			case "number":
				return el.valueAsNumber;
			case "date":
				return el.valueAsDate;
			case "file":
				return el.files;
			case "checkbox":
				return el.checked;
			default:
				return el.value;
		}
	}
	if (el instanceof HTMLTextAreaElement) {
		return el.value;
	}
	if (el instanceof HTMLSelectElement) {
		return el.value;
	}
	return el.textContent;
}

export function setValue<T extends HTMLElement>(el: T, value: unknown) {
	if (el instanceof HTMLInputElement) {
		if (el.type === "checkbox") {
			el.checked = !!value;
		} else {
			el.value = `${value}`;
		}
	} else if (el instanceof HTMLSelectElement) {
		el.value = String(value);
	} else if (el instanceof HTMLTextAreaElement) {
		el.value = String(value);
	}
}

const _has = Object.prototype.hasOwnProperty;
export function has(item: unknown, prop: string | number | symbol): boolean {
	return _has.call(item, prop);
}

export function toError(err: unknown): Error {
	if (err instanceof Error) {
		return err;
	}
	return new Error(String(err));
}

export function callOrReturn<T>(value: T | (() => T), track = false): T {
	return typeof value === "function"
		? track
			? (value as () => T)()
			: untrack(value as () => T)
		: value;
}
