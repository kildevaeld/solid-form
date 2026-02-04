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

/**
 * Waits for a condition to become true by polling at regular intervals.
 * 
 * @param condition - A function that returns true when the desired state is reached
 * @param options - Configuration options
 * @param options.interval - Time in ms between checks (default: 10ms)
 * @param options.timeout - Maximum time in ms to wait (default: 1000ms)
 * @returns A promise that resolves when the condition is met or rejects on timeout
 */
export function waitForCondition(
  condition: () => boolean,
  options: { interval?: number; timeout?: number } = {},
): Promise<void> {
  const interval = options.interval ?? 10;
  const timeout = options.timeout ?? 1000;
  const startTime = Date.now();

  return new Promise<void>((resolve, reject) => {
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime >= timeout) {
        reject(new Error("waitForCondition timeout"));
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
}

/**
 * Polls a condition multiple times to verify it remains stable.
 * Useful for testing that something does NOT happen.
 * 
 * @param condition - A function that should consistently return true
 * @param options - Configuration options
 * @param options.checks - Number of times to check the condition (default: 5)
 * @param options.interval - Time in ms between checks (default: 10ms)
 * @returns A promise that resolves after all checks pass, or rejects if any check fails
 */
export function pollCondition(
  condition: () => boolean,
  options: { checks?: number; interval?: number } = {},
): Promise<void> {
  const checks = options.checks ?? 5;
  const interval = options.interval ?? 10;
  let count = 0;

  return new Promise<void>((resolve, reject) => {
    const check = () => {
      if (!condition()) {
        reject(new Error("pollCondition failed"));
        return;
      }
      
      count++;
      if (count >= checks) {
        resolve();
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
}
