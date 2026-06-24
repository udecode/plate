import { useCallback, useState, useSyncExternalStore } from 'react';

/**
 * Create a selector that updates when an `update` function is called, and
 * which only causes the component to render when the result of `selector`
 * differs from the previous result according to `equalityFn`.
 *
 * If `selector` is memoized using `useCallback`, then it will only be called
 * when it changes or when `update` is called. Otherwise, `selector` will be
 * called every time the component renders.
 *
 * @example
 * const [state, update] = useGenericSelector(selector, equalityFn)
 *
 * useIsomorphicLayoutEffect(() => {
 *   return addEventListener(update)
 * }, [addEventListener, update])
 *
 * return state
 */

type GenericSelectorSnapshot = {
  version: number;
};

type GenericSelectorCell<T> = {
  equalityFn: (a: T | null, b: T) => boolean;
  listeners: Set<() => void>;
  selector: (() => T) | null;
  selectedState: T | null;
  snapshot: GenericSelectorSnapshot;
  subscriptionCallbackError: Error | undefined;
  version: number;
};

const createGenericSelectorCell = <T,>(
  equalityFn: (a: T | null, b: T) => boolean
): GenericSelectorCell<T> => ({
  equalityFn,
  listeners: new Set<() => void>(),
  selector: null,
  selectedState: null,
  snapshot: { version: 0 },
  subscriptionCallbackError: undefined,
  version: 0,
});

export function useGenericSelector<T>(
  selector: () => T,
  equalityFn: (a: T | null, b: T) => boolean
): [state: T, update: () => void] {
  const [cell] = useState(() => createGenericSelectorCell(equalityFn));

  cell.equalityFn = equalityFn;

  const notify = useCallback(() => {
    cell.version += 1;
    cell.snapshot = { version: cell.version };
    cell.listeners.forEach((listener) => {
      listener();
    });
  }, [cell]);

  const subscribe = useCallback(
    (listener: () => void) => {
      cell.listeners.add(listener);

      return () => {
        cell.listeners.delete(listener);
      };
    },
    [cell]
  );

  const getSnapshot = useCallback(() => cell.snapshot, [cell]);

  const update = useCallback(() => {
    const currentSelector = cell.selector;

    if (!currentSelector) {
      return;
    }

    try {
      const newSelectedState = currentSelector();

      if (cell.equalityFn(cell.selectedState, newSelectedState)) {
        return;
      }

      cell.selectedState = newSelectedState;
      cell.subscriptionCallbackError = undefined;
    } catch (err) {
      // we ignore all errors here, since when the component
      // is re-rendered, the selectors are called again, and
      // will throw again, if neither props nor store state
      // changed
      if (err instanceof Error) {
        cell.subscriptionCallbackError = err;
      } else {
        cell.subscriptionCallbackError = new Error(String(err));
      }
    }

    notify();
  }, [cell, notify]);

  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  let selectedState: T;

  try {
    if (selector !== cell.selector || cell.subscriptionCallbackError) {
      const selectorResult = selector();

      if (cell.equalityFn(cell.selectedState, selectorResult)) {
        selectedState = cell.selectedState as T;
      } else {
        selectedState = selectorResult;
      }
    } else {
      selectedState = cell.selectedState as T;
    }
  } catch (err) {
    if (cell.subscriptionCallbackError && isError(err)) {
      err.message += `\nThe error may be correlated with this previous error:\n${cell.subscriptionCallbackError.stack}\n\n`;
    }

    throw err;
  }

  cell.selector = selector;
  cell.selectedState = selectedState;
  cell.subscriptionCallbackError = undefined;

  return [selectedState, update];
}

function isError(error: any): error is Error {
  return error instanceof Error;
}
