import {
  createEffect,
  createRoot,
  createSignal,
  getOwner,
  Owner,
  runWithOwner,
} from "solid-js";

export function createAsyncRoot(testFn: (owner: Owner) => Promise<void>) {
  return new Promise((resolve, reject) => {
    createRoot((dispose) => {
      const [resource, setResource] = createSignal({ state: "STARTED" });

      const owner = getOwner()!;
      // run `testFn` as a promise, and update the `resource` signal accordingly
      Promise.resolve(
        (async () => {
          return runWithOwner(owner, () => testFn(owner));
        })(),
      ) // force testFn to be async even if it isn't
        .catch((error) => setResource({ state: "ERRORED", error }))
        .then((v) => setResource({ state: "FINISHED", value: v }));

      // listen to the `resource` signal, and resolve or reject the
      createEffect(() => {
        const resourceVal = resource();
        switch (resourceVal.state) {
          case "STARTED":
            return;
          case "FINISHED": {
            dispose();
            resolve((resourceVal as any).value);
            return;
          }
          case "ERRORED": {
            dispose();
            reject((resourceVal as any).error);
            return;
          }
        }
      });
    });
  });
}
