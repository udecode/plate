import { SPEditor } from '@udecode/slate-plugins-core';
import { moveListItem } from './moveListItem';

export const unindentListItems = (editor: SPEditor) => {
  moveListItem(editor, false);
};
