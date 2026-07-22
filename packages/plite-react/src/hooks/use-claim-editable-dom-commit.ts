import { createContext, useContext } from 'react';

import type { EditableDOMRuntime } from '../editable/editable-dom-runtime';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

export const EditableDOMRuntimeContext =
  createContext<EditableDOMRuntime | null>(null);

/**
 * Claim DOM mutations produced by a nested React commit.
 *
 * @internal Plate render boundaries use this when an external store can update
 * a descendant without publishing an editor commit.
 */
export const useClaimEditableDOMCommit = () => {
  const runtime = useContext(EditableDOMRuntimeContext);

  useIsomorphicLayoutEffect(() => {
    runtime?.claimReactCommit();
  });
};
