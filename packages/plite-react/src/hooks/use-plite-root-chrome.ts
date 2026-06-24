import { type MouseEventHandler, useMemo } from 'react';
import type { RootKey } from '@platejs/plite';

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
    'data-plite-root-chrome': RootKey;
    onMouseDownCapture: MouseEventHandler<HTMLElement>;
    onMouseMoveCapture: MouseEventHandler<HTMLElement>;
    onMouseUpCapture: MouseEventHandler<HTMLElement>;
  };
  root: RootKey;
};

/**
 * Create props for root-level mouse interaction outside editable content.
 */
export function usePliteRootChrome(
  root?: RootKey,
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
        'data-plite-root-chrome': internalRoot,
        onMouseDownCapture,
        onMouseMoveCapture,
        onMouseUpCapture,
      },
      root: internalRoot,
    }),
    [internalRoot, onMouseDownCapture, onMouseMoveCapture, onMouseUpCapture]
  );
}
