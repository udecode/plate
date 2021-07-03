import { SPEditor } from '@udecode/slate-plugins-core';
import { moveListItem } from './moveListItem';

export const indentListItems = (editor: SPEditor) => {
  moveListItem(editor, true);
};
