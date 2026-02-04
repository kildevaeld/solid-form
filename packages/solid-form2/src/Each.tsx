import {
  Collection,
  IModel,
  ListEvents,
  Model,
  ObservableObjectEvents,
} from "@kildevaeld/model";
import {
  Accessor,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  For,
  JSX,
  onCleanup,
  onMount,
  Setter,
  untrack,
} from "solid-js";
import { useEvents } from "./hooks";
import { createTrigger } from "@solid-primitives/trigger";

export type CollectionItem<T> = T extends Collection<infer U> ? U : never;

export interface EachProps<T extends Collection<any>> {
  items: T;
  children: (
    item: Accessor<CollectionItem<T>>,
    index: Accessor<number>,
  ) => JSX.Element;
}

export function Each<T extends Collection<any>>(props: EachProps<T>) {
  let collection: T | undefined,
    disposers: (() => void)[] = [],
    output = [] as JSX.Element[],
    items: Setter<any>[] = [],
    indexes = [] as Setter<number>[];
  const [track, dirty] = createTrigger();
  createEffect(() => {
    const newCollection = props.items;
    useEvents<ListEvents<any>>(newCollection, {
      change: (event) => {
        switch (event.type) {
          case "push":
            for (let i = 0; i < event.items.length; i++) {
              const item = event.items[i];
              output.push(
                createRoot((dispose) => {
                  disposers.push(dispose);
                  const [val, set] = createSignal(item);
                  items.push(set);
                  const i = output.length;
                  const [index, setIndex] = createSignal(i);
                  indexes.push(setIndex);
                  return props.children(val, index);
                }),
              );
            }
            break;
          case "remove":
            {
              const index = event.index;
              const disposer = disposers.splice(index, 1)[0];
              if (disposer) {
                disposer();
              }
              output.splice(index, 1);
              indexes.splice(index, 1);
              items.splice(index, 1);

              for (let i = index; i < indexes.length; i++) {
                const set = indexes[i];
                set(i);
              }
            }
            break;
          case "pop":
            {
              const disposer = disposers.pop();
              if (disposer) {
                disposer();
              }
              output.pop();
              items.pop();
              indexes.pop();
            }
            break;
          case "insert":
            {
              output.splice(
                event.index,
                0,
                createRoot((dispose) => {
                  disposers.push(dispose);
                  const [val, set] = createSignal(event.item);
                  items.splice(event.index, 0, set);

                  const [index, setIndex] = createSignal(event.index);
                  indexes.splice(event.index, 0, setIndex);
                  return props.children(val, index);
                }),
              );

              for (let i = event.index + 1; i < indexes.length; i++) {
                const set = indexes[i];
                set(i);
              }
            }
            break;
          case "set":
            {
            }
            break;
        }

        dirty();
      },
    });

    if (collection !== newCollection) {
      disposers.forEach((d) => d());
      disposers = new Array(newCollection.length);
      output.length = 0;
      collection = newCollection;
      output = new Array(collection.length);
      items = new Array(collection.length);
      indexes = new Array(collection.length);
      for (let i = 0; i < collection.length; i++) {
        output[i] = createRoot((dispose) => {
          disposers[i] = dispose;
          const [val, set] = createSignal(collection!.at(i)!);
          items[i] = set;
          const [index, setIndex] = createSignal(i);
          indexes[i] = setIndex;
          return props.children(val, index);
        });
      }
    }
  });

  onCleanup(() => {
    disposers.forEach((d) => d());
  });

  const out = createMemo(() => {
    track();
    return output;
  });

  return <>{out()}</>;
}
