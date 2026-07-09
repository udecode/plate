import type { BaseEditor } from '@platejs/core';
import { PathApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { selectInsertedBlocks } from './selectInsertedBlocks';

export const pasteSelectedBlocks = (editor: BaseEditor, e: ClipboardEvent) => {
  const { api } = editor.plugin(BlockSelectionPlugin);

  const entries = api.getNodes();

  if (entries.length > 0) {
    const entry = entries.at(-1)!;
    const [node, path] = entry;

    if (!editor.read.nodes.isEmpty(node)) {
      const at = PathApi.next(path);

      editor.update.nodes.insert(
        { children: [{ text: '' }], type: editor.getType(KEYS.p) },
        {
          at,
          select: true,
        }
      );
    }

    editor.api.clipboard.insertData(e.clipboardData!);

    selectInsertedBlocks(editor);
  }
};
