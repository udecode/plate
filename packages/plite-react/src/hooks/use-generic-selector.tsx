import { useState, useSyncExternalStore } from 'react';

import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/**
 * Create a selector that updates when an `update` function is called, and
 * which only causes the component to render when the result of `selector`
 * differs from the previous result according to `equalityFn`.
 *
 * The latest selector and equality function are committed after each render,
 * so callers do not need to memoize inline selectors for correctness.
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

type CommittedGenericSelector<T> = {
  equalityFn: (a: T | null, b: T) => boolean;
  selector: (() => T) | null;
  selectedState: T | null;
  subscriptionCallbackError: Error | undefined;
};

const createGenericSelectorStore = <T,>(
  equalityFn: (a: T | null, b: T) => boolean
) => {
  let committed: CommittedGenericSelector<T> = {
    equalityFn,
    selector: null,
    selectedState: null,
    subscriptionCallbackError: undefined,
  };
  let snapshot: GenericSelectorSnapshot = { version: 0 };
  const listeners = new Set<() => void>();

  const notify = () => {
    snapshot = { version: snapshot.version + 1 };
    listeners.forEach((listener) => {
      listener();
    });
  };

  return {
    commitRender: (
      renderSnapshot: GenericSelectorSnapshot,
      selector: () => T,
      nextEqualityFn: (a: T | null, b: T) => boolean,
      selectedState: T
    ) => {
      if (snapshot !== renderSnapshot) {
        return;
      }

      committed = {
        equalityFn: nextEqualityFn,
        selector,
        selectedState,
        subscriptionCallbackError: undefined,
      };
    },
    getCommitted: () => committed,
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    update: () => {
      if (!committed.selector) {
        return;
      }

      try {
        const newSelectedState = committed.selector();

        if (committed.equalityFn(committed.selectedState, newSelectedState)) {
          return;
        }

        committed = {
          ...committed,
          selectedState: newSelectedState,
          subscriptionCallbackError: undefined,
        };
      } catch (error) {
        committed = {
          ...committed,
          subscriptionCallbackError:
            error instanceof Error ? error : new Error(String(error)),
        };
      }

      notify();
    },
  };
};

export function useGenericSelector<T>(
  selector: () => T,
  equalityFn: (a: T | null, b: T) => boolean
): [state: T, update: () => void] {
  const [store] = useState(() => createGenericSelectorStore(equalityFn));
  const renderSnapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );
  const committed = store.getCommitted();

  let selectedState: T;

  try {
    if (
      selector !== committed.selector ||
      committed.subscriptionCallbackError
    ) {
      const selectorResult = selector();

      if (equalityFn(committed.selectedState, selectorResult)) {
        selectedState = committed.selectedState as T;
      } else {
        selectedState = selectorResult;
      }
    } else {
      selectedState = committed.selectedState as T;
    }
  } catch (error) {
    if (committed.subscriptionCallbackError && isError(error)) {
      error.message += `\nThe error may be correlated with this previous error:\n${committed.subscriptionCallbackError.stack}\n\n`;
    }

    throw error;
  }

  useIsomorphicLayoutEffect(() => {
    store.commitRender(renderSnapshot, selector, equalityFn, selectedState);
  }, [equalityFn, renderSnapshot, selectedState, selector, store]);

  return [selectedState, store.update];
}

function isError(error: any): error is Error {
  return error instanceof Error;
}
