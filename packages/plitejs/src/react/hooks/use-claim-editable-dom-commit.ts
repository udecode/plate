import { createContext, useContext, useSyncExternalStore } from 'react';

import type { EditableDOMRuntime } from '../editable/editable-dom-runtime';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

export const EditableDOMRuntimeContext =
  createContext<EditableDOMRuntime | null>(null);

export const useEditableDOMRuntime = () =>
  useContext(EditableDOMRuntimeContext);

const subscribeToNoHostFacts = () => () => {};

export const useEditableDOMHostFact = <T>(
  read: (runtime: EditableDOMRuntime) => T,
  serverValue: T
) => {
  const runtime = useEditableDOMRuntime();

  return useSyncExternalStore(
    runtime?.subscribeHostFacts ?? subscribeToNoHostFacts,
    () => (runtime ? read(runtime) : serverValue),
    () => serverValue
  );
};

/**
 * Claim DOM mutations produced by a nested React commit.
 *
 * Plate render boundaries use this when an external store can update
 * a descendant without publishing an editor commit.
 *
 */
export const useClaimEditableDOMCommit = () => {
  const runtime = useContext(EditableDOMRuntimeContext);

  useIsomorphicLayoutEffect(() => {
    runtime?.claimReactCommit();
  });
};
