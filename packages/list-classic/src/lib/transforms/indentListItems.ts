import type { BaseEditor } from '@platejs/core';
import type { ListTransaction } from '../BaseListPlugin';

import { moveListItems } from './moveListItems';

export const indentListItems = (editor: BaseEditor, tx: ListTransaction) => {
  moveListItems(editor, tx, { increase: true });
};
