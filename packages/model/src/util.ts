export type Equality<T> = (a: T | undefined, b: T | undefined) => boolean;

export function isEqual<T>(a: T | undefined, b: T | undefined): boolean {
  return a === b;
}
