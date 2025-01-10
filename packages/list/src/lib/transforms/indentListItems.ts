import type { SlateEditor } from '@udecode/plate';

import { moveListItems } from './moveListItems';

export const indentListItems = (editor: SlateEditor) => {
  moveListItems(editor, { increase: true });
};
