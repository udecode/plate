import type { PlateEditor } from '@udecode/plate-common';

import { moveListItems } from './moveListItems';

export const indentListItems = (editor: PlateEditor) => {
  moveListItems(editor, { increase: true });
};
