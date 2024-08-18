import type { SlateEditor } from '@udecode/plate-common';

import { moveListItems } from './moveListItems';

export const indentListItems = (editor: SlateEditor) => {
  moveListItems(editor, { increase: true });
};
