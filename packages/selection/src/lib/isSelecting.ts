import type { PlateEditor } from 'platejs/react';

import { BlockSelectionPlugin } from '../react';

export const isSelecting = (editor: PlateEditor) => {
  const isSelectingSome = editor.getOption(
    BlockSelectionPlugin,
    'isSelectingSome'
  );
  const selectionExpanded = editor.api.isExpanded();

  return selectionExpanded || isSelectingSome;
};
