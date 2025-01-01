import {
  type SlateEditor,
  getEditorPlugin,
  getStartPoint,
  insertNodes,
  isElementEmpty,
} from '@udecode/plate-common';
import { Path } from 'slate';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { selectInsertedBlocks } from './selectInsertedBlocks';

export const pasteSelectedBlocks = (editor: SlateEditor, e: ClipboardEvent) => {
  const { api } = getEditorPlugin(editor, BlockSelectionPlugin);

  const entries = api.blockSelection.getNodes();

  if (entries.length > 0) {
    const entry = entries.at(-1)!;
    const [node, path] = entry;

    editor.tf.focus(getStartPoint(editor, path));

    if (!isElementEmpty(editor, node as any)) {
      const at = Path.next(path);

      insertNodes(editor, editor.api.create.block({}, at), {
        at,
        select: true,
      });
    }

    // quick fix until we find a way to merge history
    // withoutMergingHistory(editor, () => {
    editor.insertData(e.clipboardData!);
    // });
    // insertData is focusing the editor so deselect
    editor.tf.deselect();

    selectInsertedBlocks(editor);
  }
};
