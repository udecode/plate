import type { BaseEditor } from '@platejs/core';
import { PathApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { getBlockSelectionNodes } from '../internal/getBlockSelectionNodes';
import { selectInsertedBlocks } from './selectInsertedBlocks';

export const pasteSelectedBlocks = (editor: BaseEditor, e: ClipboardEvent) => {
  const data = e.clipboardData;
  const selectedIds = editor
    .plugin(BlockSelectionPlugin)
    .getOption('selectedIds');

  if (!data || !selectedIds?.size) return;

  editor.update((tx, { afterCommit }) => {
    const entries = getBlockSelectionNodes(tx, selectedIds);
    const entry = entries.at(-1);

    if (!entry) return;

    const [node, path] = entry;

    if (!tx.nodes.isEmpty(node)) {
      const at = PathApi.next(path);

      tx.nodes.insert(
        { children: [{ text: '' }], type: editor.getType(KEYS.p) },
        {
          at,
          select: true,
        }
      );
    }

    editor.api.clipboard.insertData(data);

    afterCommit(() => selectInsertedBlocks(editor));
  });
};
