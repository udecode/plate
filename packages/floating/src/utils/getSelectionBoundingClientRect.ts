import type { ClientRectObject } from '@floating-ui/core';
import { RangeApi, type Value } from '@platejs/plite';
import type { DOMCapableEditor } from '@platejs/plite-dom';

import { getDefaultBoundingClientRect } from '../createVirtualElement';
import { getRangeBoundingClientRect } from './getRangeBoundingClientRect';

/** Get bounding client rect of the editor selection */
export const getSelectionBoundingClientRect = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: DOMCapableEditor<V, TExtensions>
): ClientRectObject => {
  const selection = editor.read.selection();

  if (selection && RangeApi.isExpanded(selection)) {
    return getRangeBoundingClientRect(editor, selection);
  }

  return getDefaultBoundingClientRect();
};
