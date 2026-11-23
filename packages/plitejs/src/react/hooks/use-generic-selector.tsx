import { useState, useSyncExternalStore } from 'react';

import { sameResult } from '../../core/same-result';
import { countCoreWork } from '../../core/work';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

type GenericSelectorSnapshot = {
  version: number;
};

type CommittedGenericSelector<T> = {
  equalityFn: (a: T, b: T) => boolean;
  selection: { selector: () => T; state: T } | null;
  subscriptionCallbackError: Error | undefined;
};

const createGenericSelectorStore = <T,>(
  equalityFn: (a: T, b: T) => boolean
) => {
  let committed: CommittedGenericSelector<T> = {
    equalityFn,
    selection: null,
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
      nextEqualityFn: (a: T, b: T) => boolean,
      selectedState: T
    ) => {
      if (snapshot !== renderSnapshot) {
        return;
      }

      committed = {
        equalityFn: nextEqualityFn,
        selection: { selector, state: selectedState },
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
      const { selection } = committed;

      if (!selection) {
        return;
      }

      try {
        countCoreWork('selectorVisits');
        const newSelectedState = selection.selector();

        if (committed.equalityFn(selection.state, newSelectedState)) {
          return;
        }

        committed = {
          ...committed,
          selection: { selector: selection.selector, state: newSelectedState },
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
  equalityFn: (a: T, b: T) => boolean = sameResult
): [state: T, update: () => void] {
  'use no memo';

  const [store] = useState(() => createGenericSelectorStore(equalityFn));
  const renderSnapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );
  const committed = store.getCommitted();
  const { selection } = committed;

  let selectedState: T;

  try {
    if (
      selection &&
      selector === selection.selector &&
      equalityFn === committed.equalityFn &&
      !committed.subscriptionCallbackError
    ) {
      selectedState = selection.state;
    } else {
      const selectorResult = selector();

      selectedState =
        selection && equalityFn(selection.state, selectorResult)
          ? selection.state
          : selectorResult;
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
