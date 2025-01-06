import type { ClientRectObject } from '@floating-ui/core';
import type { PlateEditor } from '@udecode/plate/react';

import { getDefaultBoundingClientRect } from '../createVirtualElement';
import { getRangeBoundingClientRect } from './getRangeBoundingClientRect';

/** Get bounding client rect of the editor selection */
export const getSelectionBoundingClientRect = (
  editor: PlateEditor
): ClientRectObject => {
  if (editor.api.isExpanded()) {
    return getRangeBoundingClientRect(editor, editor.selection);
  }

  return getDefaultBoundingClientRect();
};
