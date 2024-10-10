import type { ClientRectObject } from '@floating-ui/core';
import type { PlateEditor } from '@udecode/plate-common/react';

import { isSelectionExpanded } from '@udecode/plate-common';

import { getDefaultBoundingClientRect } from '../createVirtualElement';
import { getRangeBoundingClientRect } from './getRangeBoundingClientRect';

/** Get bounding client rect of the editor selection */
export const getSelectionBoundingClientRect = (
  editor: PlateEditor
): ClientRectObject => {
  if (isSelectionExpanded(editor)) {
    return getRangeBoundingClientRect(editor, editor.selection);
  }

  return getDefaultBoundingClientRect();
};
