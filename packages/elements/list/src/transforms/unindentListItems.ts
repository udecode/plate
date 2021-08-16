import { SPEditor } from '@udecode/plate-core';
import { Editor } from 'slate';
import { moveListItems } from './moveListItems';

export const unindentListItems = (editor: SPEditor) => {
  Editor.withoutNormalizing(editor, () => {
    moveListItems(editor, false);
  });
};
