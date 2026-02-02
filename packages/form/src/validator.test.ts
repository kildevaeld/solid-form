import { describe, test, expect } from "vitest";
import {
  ValidationError,
  PatternValidation,
  pattern,
  MinValidation,
  min,
  MaxValidation,
  max,
} from "./validator";

describe("ValidationError", () => {
  test("should be instance of Error", () => {
    const err = new ValidationError("Oops");
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("Oops");
  });
});

describe("PatternValidation", () => {
  test("should validate string matching pattern", async () => {
    const v = new PatternValidation(/^[a-z]+$/);
    await expect(v.validate("abc")).resolves.toBeUndefined();
  });

  test("should throw ValidationError when pattern does not match", async () => {
    const v = new PatternValidation(/^[a-z]+$/);
    await expect(v.validate("abc123")).rejects.toBeInstanceOf(ValidationError);
  });

  test("pattern helper should return PatternValidation", () => {
    const v = pattern("^[a-z]+$");
    expect(v).toBeInstanceOf(PatternValidation);
  });
});

describe("MinValidation", () => {
  test("should validate string length", async () => {
    const v = new MinValidation<string>(3);
    await expect(v.validate("abc")).resolves.toBeUndefined();
    await expect(v.validate("ab")).rejects.toBeInstanceOf(ValidationError);
  });

  test("should validate number as length", async () => {
    const v = new MinValidation<number>(5);
    await expect(v.validate(5)).resolves.toBeUndefined();
    await expect(v.validate(4)).rejects.toBeInstanceOf(ValidationError);
  });

  test("should validate array length", async () => {
    const v = new MinValidation<unknown[]>(2);
    await expect(v.validate([1, 2])).resolves.toBeUndefined();
    await expect(v.validate([1])).rejects.toBeInstanceOf(ValidationError);
  });

  test("should throw TypeError for invalid value", async () => {
    const v = new MinValidation<any>(1);
    await expect(v.validate({})).rejects.toBeInstanceOf(TypeError);
  });

  test("min helper should return MinValidation", () => {
    const v = min<string>(2);
    expect(v).toBeInstanceOf(MinValidation);
  });
});

describe("MaxValidation", () => {
  test("should validate string length", async () => {
    const v = new MaxValidation<string>(3);
    await expect(v.validate("abc")).resolves.toBeUndefined();
    await expect(v.validate("abcd")).rejects.toBeInstanceOf(ValidationError);
  });

  test("should validate number as length", async () => {
    const v = new MaxValidation<number>(5);
    await expect(v.validate(5)).resolves.toBeUndefined();
    await expect(v.validate(6)).rejects.toBeInstanceOf(ValidationError);
  });

  test("should validate array length", async () => {
    const v = new MaxValidation<unknown[]>(2);
    await expect(v.validate([1, 2])).resolves.toBeUndefined();
    await expect(v.validate([1, 2, 3])).rejects.toBeInstanceOf(ValidationError);
  });

  test("should throw TypeError for invalid value", async () => {
    const v = new MaxValidation<any>(1);
    await expect(v.validate({})).rejects.toBeInstanceOf(TypeError);
  });

  test("max helper should return MaxValidation", () => {
    const v = max<string>(2);
    expect(v).toBeInstanceOf(MaxValidation);
  });
});
