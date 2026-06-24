import { type BasePlateEditor, getEditorPlugin, KEYS, PathApi } from 'platejs';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { selectInsertedBlocks } from './selectInsertedBlocks';

export const pasteSelectedBlocks = (
  editor: BasePlateEditor,
  e: ClipboardEvent
) => {
  const { api } = getEditorPlugin(editor, BlockSelectionPlugin);

  const entries = api.blockSelection.getNodes();

  if (entries.length > 0) {
    const entry = entries.at(-1)!;
    const [node, path] = entry;

    if (!editor.api.isEmpty(node)) {
      const at = PathApi.next(path);

      editor.update((tx) => {
        tx.nodes.insert(
          { children: [{ text: '' }], type: editor.getType(KEYS.p) },
          { at }
        );
        tx.selection.set(editor.api.end(at)!);
      });
    }

    editor.api.clipboard.insertData(e.clipboardData!);

    selectInsertedBlocks(editor);
  }
};
