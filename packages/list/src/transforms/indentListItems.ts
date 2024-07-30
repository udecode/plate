import type { PlateEditor } from '@udecode/plate-common/server';

import { moveListItems } from './moveListItems';

export const indentListItems = (editor: PlateEditor) => {
  moveListItems(editor, { increase: true });
};
