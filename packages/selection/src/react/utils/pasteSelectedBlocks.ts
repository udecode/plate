import {
  type SlateEditor,
  deselect,
  getEditorPlugin,
  getStartPoint,
  insertNodes,
  isElementEmpty,
} from '@udecode/plate-common';
import { focusEditor, insertData } from '@udecode/plate-common/react';
import { Path } from 'slate';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { selectInsertedBlocks } from './selectInsertedBlocks';

export const pasteSelectedBlocks = (editor: SlateEditor, e: ClipboardEvent) => {
  const { api } = getEditorPlugin(editor, BlockSelectionPlugin);

  const entries = api.blockSelection.getSelectedBlocks();

  if (entries.length > 0) {
    const entry = entries.at(-1)!;
    const [node, path] = entry;

    focusEditor(editor, getStartPoint(editor, path));

    if (!isElementEmpty(editor, node as any)) {
      const at = Path.next(path);

      insertNodes(editor, editor.api.blockFactory({}, at), {
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
