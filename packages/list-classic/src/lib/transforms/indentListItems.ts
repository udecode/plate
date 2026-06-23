import type { SlateEditor } from '@platejs/core';

import { moveListItems } from './moveListItems';

export const indentListItems = (editor: SlateEditor) => {
  moveListItems(editor, { increase: true });
};
