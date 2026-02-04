export class Validator<T> {}

export class ValidationError extends Error {}

export interface Validation<T> {
  validate(value: T): Promise<void>;
}

export abstract class AbstractValidation {
  readonly message: string | undefined;
  constructor(message?: string) {
    this.message = message;
  }

  toString() {
    return this.message;
  }
}

export class PatternValidation
  extends AbstractValidation
  implements Validation<string>
{
  constructor(
    public readonly pattern: RegExp | string,
    message?: string,
  ) {
    super(message ?? `Value does not match pattern: ${pattern}`);
  }

  async validate(value: string) {
    if (value.match(this.pattern) == null) {
      throw new ValidationError(this.message);
    }
  }
}

export function pattern(pattern: string | RegExp, message?: string) {
  return new PatternValidation(pattern, message);
}

abstract class LengthBase extends AbstractValidation {
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
  constructor(
    public readonly min: number,
    message?: string,
  ) {
    super(message ?? `Minimum length is ${min}`);
  }

  async validate(value: T) {
    const len = this.getLenth(value);
    if (len < this.min) {
      throw new ValidationError(this.message);
    }
  }
}

export function min<T extends string | number | unknown[]>(
  min: number,
  message?: string,
): MinValidation<T> {
  return new MinValidation(min, message);
}

export class MaxValidation<T extends string | number | unknown[]>
  extends LengthBase
  implements Validation<T>
{
  constructor(
    public readonly max: number,
    message?: string,
  ) {
    super(message ?? `Maximum length is ${max}`);
  }

  async validate(value: T) {
    const len = this.getLenth(value);

    if (len > this.max) {
      throw new ValidationError(this.message);
    }
  }
}

export function max<T extends string | number | unknown[]>(
  max: number,
  message?: string,
): MaxValidation<T> {
  return new MaxValidation(max, message);
}
