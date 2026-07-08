import type { BaseEditor } from '@platejs/core';

import { KEYS } from '@platejs/utils';

export const isSelecting = (editor: BaseEditor) => {
  const selectedIds = editor
    .plugin({ key: KEYS.blockSelection })
    .getOption('selectedIds');
  const selectionExpanded = editor.read.selection.isExpanded();

  return selectionExpanded || !!selectedIds?.size;
};
