import { PlateEditor, TPlateEditor } from '@udecode/plate-core';
import { moveListItems } from './moveListItems';

export const indentListItems = (editor: PlateEditor) => {
  moveListItems(editor, { increase: true });
};
