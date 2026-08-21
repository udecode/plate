import type { NamedRootKey, RootKey } from '@platejs/plite';
import { type MouseEventHandler, useMemo } from 'react';

import { useRootInteractionController } from '../editable/root-interaction-controller';
import { MAIN_ROOT_KEY } from '../root-key';
import {
  useRequiredPliteRuntimeContext,
  usePliteRootEditor,
} from './use-plite-runtime';

/** Options for mouse interaction on root-level chrome outside editable text. */
export type UsePliteRootChromeOptions = {
  disabled?: boolean;
  selection?: 'end' | 'restore';
};

/** Props and root metadata for root-level mouse interaction chrome. */
export type PliteRootChromeController = {
  props: {
    'data-plite-root-chrome'?: NamedRootKey;
    onMouseDownCapture: MouseEventHandler<HTMLElement>;
    onMouseMoveCapture: MouseEventHandler<HTMLElement>;
    onMouseUpCapture: MouseEventHandler<HTMLElement>;
  };
  root: NamedRootKey | undefined;
};

/**
 * Create props for root-level mouse interaction outside editable content.
 */
export function usePliteRootChrome<const TRoot extends RootKey = RootKey>(
  root?: NamedRootKey<TRoot>,
  { disabled = false, selection = 'restore' }: UsePliteRootChromeOptions = {}
): PliteRootChromeController {
  if (root === MAIN_ROOT_KEY) {
    throw new Error(
      '[Plite] Omit root to create chrome for the primary document.'
    );
  }

  const internalRoot = root ?? MAIN_ROOT_KEY;
  const editor = usePliteRootEditor(root);
  const { getLastSelectionForRoot, getMountedViewEditor } =
    useRequiredPliteRuntimeContext();
  const { onMouseDownCapture, onMouseMoveCapture, onMouseUpCapture } =
    useRootInteractionController({
      disabled,
      editor,
      getLastSelectionForRoot,
      getMountedViewEditor,
      root: internalRoot,
      selection,
    });

  return useMemo(
    () => ({
      props: {
        ...(root ? { 'data-plite-root-chrome': root } : {}),
        onMouseDownCapture,
        onMouseMoveCapture,
        onMouseUpCapture,
      },
      root,
    }),
    [onMouseDownCapture, onMouseMoveCapture, onMouseUpCapture, root]
  );
}
