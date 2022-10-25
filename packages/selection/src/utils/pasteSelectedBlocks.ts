import {
  deselect,
  ELEMENT_DEFAULT,
  focusEditor,
  getPluginType,
  getStartPoint,
  insertData,
  insertNodes,
  isElementEmpty,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { Path } from 'slate';
import { getSelectedBlocks } from '../queries/getSelectedBlocks';
import { selectInsertedBlocks } from './selectInsertedBlocks';

export const pasteSelectedBlocks = <V extends Value>(
  editor: PlateEditor<V>,
  e: ClipboardEvent
) => {
  const entries = getSelectedBlocks(editor);

  if (entries.length) {
    const entry = entries[entries.length - 1];
    const [node, path] = entry;

    focusEditor(editor, getStartPoint(editor, path));

    if (!isElementEmpty(editor, node as any)) {
      insertNodes(
        editor,
        {
          type: getPluginType(editor, ELEMENT_DEFAULT),
          children: [{ text: '' }],
        } as any,
        {
          at: Path.next(path),
          select: true,
        }
      );
    }

    // quick fix until we find a way to merge history
    // withoutMergingHistory(editor, () => {
    insertData(editor, e.clipboardData!);
    // });
    // insertData is focusing the editor so deselect
    deselect(editor);

    selectInsertedBlocks(editor);
  }
};
