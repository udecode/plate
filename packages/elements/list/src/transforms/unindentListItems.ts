import { SPEditor } from '@udecode/slate-plugins-core';
import { moveListItems } from './moveListItems';

export const unindentListItems = (editor: SPEditor) => {
  moveListItems(editor, false);
};
