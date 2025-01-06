import {
  type SlateEditor,
  PathApi,
  getEditorPlugin,
} from '@udecode/plate';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { selectInsertedBlocks } from './selectInsertedBlocks';

export const pasteSelectedBlocks = (editor: SlateEditor, e: ClipboardEvent) => {
  const { api } = getEditorPlugin(editor, BlockSelectionPlugin);

  const entries = api.blockSelection.getNodes();

  if (entries.length > 0) {
    const entry = entries.at(-1)!;
    const [node, path] = entry;

    editor.tf.focus(editor.api.start(path));

    if (!editor.api.isEmpty(node as any)) {
      const at = PathApi.next(path);

      editor.tf.insertNodes(editor.api.create.block({}, at), {
        at,
        select: true,
      });
    }

    // quick fix until we find a way to merge history
    // editor.tf.withoutMerging(() => {
    editor.insertData(e.clipboardData!);
    // });
    // insertData is focusing the editor so deselect
    editor.tf.deselect();

    selectInsertedBlocks(editor);
  }
};
