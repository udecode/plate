import {
  ELEMENT_DEFAULT,
  type PlateEditor,
  findNodePath,
  getNextNodeStartPoint,
  insertNodes,
  nanoid,
  setSelection,
} from '@udecode/plate-common';

export const triggerComboboxNextBlock = (
  editor: PlateEditor,
  triggerText: string
) => {
  const emptyBlock = {
    children: [{ text: '' }],
    id: nanoid(),
    type: ELEMENT_DEFAULT,
  };
  insertNodes(editor, emptyBlock, { nextBlock: true });
  const path = findNodePath(editor, emptyBlock)!;
  const point = getNextNodeStartPoint(editor, path);
  setSelection(editor, { anchor: point, focus: point });
  editor.insertText(triggerText);
};
