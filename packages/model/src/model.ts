import {
  IObservableObject,
  ObservableObject,
  ObservableObjectSchema,
} from "./object.js";
import { Equality, isEqual } from "./util.js";

export interface IModel<
  T extends ObservableObjectSchema,
  PK extends keyof T,
> extends IObservableObject<T> {
  readonly id: T[PK] | undefined;
}

export interface ModelOptions<
  T extends ObservableObjectSchema,
  PK extends keyof T,
> {
  primaryKey: PK;
  values: T;
}

export type PrimaryKey<T> = T extends IModel<any, infer PK> ? PK : never;

export type PrimaryKeyValue<T> =
  T extends Model<infer S, infer PK> ? S[PK] : never;

export class Model<T extends ObservableObjectSchema, PK extends keyof T>
  extends ObservableObject<T>
  implements IModel<T, PK>
{
  #primaryKey: PK;
  constructor(
    options: ModelOptions<T, PK>,
    equal: Equality<T[keyof T]> = isEqual,
  ) {
    super(options.values, equal);
    this.#primaryKey = options.primaryKey;
  }

  get id(): T[PK] | undefined {
    return this.get(this.#primaryKey);
  }
}
