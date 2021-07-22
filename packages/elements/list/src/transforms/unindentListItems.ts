import { SPEditor } from '@udecode/plate-core';
import { moveListItems } from './moveListItems';

export const unindentListItems = (editor: SPEditor) => {
  moveListItems(editor, false);
};
