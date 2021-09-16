import { SPEditor } from '@udecode/plate-core';
import { moveListItems } from './moveListItems';

export const indentListItems = (editor: SPEditor) => {
  moveListItems(editor, { increase: true });
};
