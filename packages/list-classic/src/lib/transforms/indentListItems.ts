import type { SlateEditor } from 'platejs';

import { moveListItems } from './moveListItems';

export const indentListItems = (editor: SlateEditor) => {
  moveListItems(editor, { increase: true });
};
