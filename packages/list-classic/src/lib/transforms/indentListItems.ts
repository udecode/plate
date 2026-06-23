import type { BasePlateEditor } from '@platejs/core';

import { moveListItems } from './moveListItems';

export const indentListItems = (editor: BasePlateEditor) => {
  moveListItems(editor, { increase: true });
};
