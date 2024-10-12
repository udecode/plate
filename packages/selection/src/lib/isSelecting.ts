import type { PlateEditor } from '@udecode/plate-common/react';

import { isSelectionExpanded } from '@udecode/plate-common';

import { BlockSelectionPlugin } from '../react';

export const isSelecting = (editor: PlateEditor) => {
  const isSelectingSome = editor.getOption(
    BlockSelectionPlugin,
    'isSelectingSome'
  );
  const selectionExpanded = isSelectionExpanded(editor);

  return selectionExpanded || isSelectingSome;
};
