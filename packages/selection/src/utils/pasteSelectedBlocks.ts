import {
  deselect,
  focusEditor,
  getStartPoint,
  insertData,
  insertNodes,
  isElementEmpty,
  PlateEditor,
  Value,
} from '@udecode/plate-common';
import { Path } from 'slate';

import { getSelectedBlocks } from '../queries/getSelectedBlocks';
import { selectInsertedBlocks } from './selectInsertedBlocks';

export const pasteSelectedBlocks = <V extends Value>(
  editor: PlateEditor<V>,
  e: ClipboardEvent
) => {
  const entries = getSelectedBlocks(editor);

  if (entries.length > 0) {
    const entry = entries.at(-1)!;
    const [node, path] = entry;

    focusEditor(editor, getStartPoint(editor, path));

    if (!isElementEmpty(editor, node as any)) {
      const at = Path.next(path);

      insertNodes(editor, editor.blockFactory({}, at), {
        at,
        select: true,
      });
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
