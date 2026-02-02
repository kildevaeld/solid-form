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
      if (el.type === "date" && value instanceof Date) {
        el.valueAsDate = value;
      } else {
        el.value = `${value}`;
      }
    }
  } else if (el instanceof HTMLSelectElement) {
    el.value = String(value);
  } else if (el instanceof HTMLTextAreaElement) {
    el.value = String(value);
  }
}

export function debounced<T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number,
): ((...args: T) => void) & { stop: () => void } {
  let timeoutId: number;
  const out = (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };

  out.stop = () => {
    clearTimeout(timeoutId);
  };

  return out;
}
