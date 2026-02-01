import { type Accessor, createComputed, onCleanup } from "solid-js";
import { getValue, setValue as setElValue } from "./util.js";

export function createControl<T>(
	value: Accessor<T | undefined>,
	setValue: (value: T | undefined) => void,
	touch: () => void,
) {
	return <E extends HTMLElement>(
		el: E,
		p?: Accessor<true | "input" | "change">,
	) => {
		const input = (_e: Event) => {
			setValue(getValue(el) as unknown as T);
		};

		const blur = (_e: Event) => {
			touch();
		};

		createComputed(() => {
			setElValue(el, value() ?? "");
		});

		const event = (p?.() === true ? "input" : (p?.() as string)) ?? "input";

		el.addEventListener(event, input);
		el.addEventListener("blur", blur);

		onCleanup(() => {
			el.removeEventListener(event, input);
			el.removeEventListener("blur", blur);
		});
	};
}
