import { ObservableList } from "./list.js";
import { Model, PrimaryKeyValue } from "./model.js";

export class Collection<M extends Model<any, any>> extends ObservableList<M> {
  get(id: NonNullable<PrimaryKeyValue<M>>): M | undefined {
    return this.find((item) => item.id === id);
  }
}
