import { type MouseEventHandler, useMemo } from 'react';
import type { RootKey } from '@platejs/slate';

import { useRootInteractionController } from '../editable/root-interaction-controller';
import { MAIN_ROOT_KEY } from '../root-key';
import {
  useRequiredSlateRuntimeContext,
  useSlateRootEditor,
} from './use-slate-runtime';

/** Options for mouse interaction on root-level chrome outside editable text. */
export type UseSlateRootChromeOptions = {
  disabled?: boolean;
  selection?: 'end' | 'restore';
};

/** Props and root metadata for root-level mouse interaction chrome. */
export type SlateRootChromeController = {
  props: {
    'data-slate-root-chrome': RootKey;
    onMouseDownCapture: MouseEventHandler<HTMLElement>;
    onMouseMoveCapture: MouseEventHandler<HTMLElement>;
    onMouseUpCapture: MouseEventHandler<HTMLElement>;
  };
  root: RootKey;
};

/**
 * Create props for root-level mouse interaction outside editable content.
 */
export function useSlateRootChrome(
  root?: RootKey,
  { disabled = false, selection = 'restore' }: UseSlateRootChromeOptions = {}
): SlateRootChromeController {
  if (root === MAIN_ROOT_KEY) {
    throw new Error(
      '[Slate] Omit root to create chrome for the primary document.'
    );
  }

  const internalRoot = root ?? MAIN_ROOT_KEY;
  const editor = useSlateRootEditor(root);
  const { getLastSelectionForRoot, getMountedViewEditor } =
    useRequiredSlateRuntimeContext();
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
        'data-slate-root-chrome': internalRoot,
        onMouseDownCapture,
        onMouseMoveCapture,
        onMouseUpCapture,
      },
      root: internalRoot,
    }),
    [internalRoot, onMouseDownCapture, onMouseMoveCapture, onMouseUpCapture]
  );
}
