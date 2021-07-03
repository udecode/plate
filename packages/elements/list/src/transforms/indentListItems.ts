import { SPEditor } from '@udecode/slate-plugins-core';
import { moveListItems } from './moveListItems';

export const indentListItems = (editor: SPEditor) => {
  moveListItems(editor, true);
};
