export class Validator<T> {}

export class ValidationError extends Error {}

export interface Validation<T> {
  validate(value: T): void;
}

export abstract class AValidation {
  readonly message: string | undefined;
  constructor(message?: string) {
    this.message = message;
  }

  toString() {
    return this.message;
  }
}

export class PatternValidation implements Validation<string> {
  constructor(public readonly pattern: RegExp | string) {}

  validate(value: string): void {
    if (value.match(this.pattern) == null) {
      throw new ValidationError(`Expected pattern: ${this.pattern}`);
    }
  }
}

export function pattern(pattern: string | RegExp) {
  return new PatternValidation(pattern);
}

abstract class LengthBase extends AValidation {
  getLenth(value: string | number | unknown[]) {
    let len = 0;
    if (typeof value === "string") {
      len = value.length;
    } else if (typeof value === "number") {
      len = value;
    } else if (Array.isArray(value)) {
      len = value.length;
    } else {
      throw new TypeError("Invalid value");
    }
    return len;
  }
}

export class MinValidation<T extends string | number | unknown[]>
  extends LengthBase
  implements Validation<T>
{
  constructor(public readonly min: number) {
    super("Min");
  }

  validate(value: T): void {
    const len = this.getLenth(value);
    if (len < this.min) {
      throw new ValidationError("Min");
    }
  }
}

export function min<T extends string | number | unknown[]>(
  min: number,
): MinValidation<T> {
  return new MinValidation(min);
}

export class MaxValidation<T extends string | number | unknown[]>
  extends LengthBase
  implements Validation<T>
{
  constructor(public readonly max: number) {
    super();
  }

  validate(value: T): void {
    const len = this.getLenth(value);

    if (len > this.max) {
      throw new ValidationError("Min");
    }
  }
}

export function max<T extends string | number | unknown[]>(
  max: number,
): MaxValidation<T> {
  return new MaxValidation(max);
}
