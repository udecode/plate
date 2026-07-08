import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction, Element, Path } from '@platejs/plite';

import { PathApi } from '@platejs/plite';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const insertBlocksAndSelect = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  nodes: Element[],
  { at, insertedCallback }: { at: Path; insertedCallback?: () => void }
) => {
  const { setOption } = editor.plugin(BlockSelectionPlugin);

  tx.nodes.insert(nodes, { at });
  insertedCallback?.();

  const insertedNodes = [editor.read.nodes.get<Element>(at)![0]];
  let count = 1;
  let path = at;

  while (count < nodes.length) {
    path = PathApi.next(path);
    const nextNode = editor.read.nodes.get<Element>(path)![0];
    insertedNodes.push(nextNode);
    count++;
  }

  setTimeout(() => {
    setOption(
      'selectedIds',
      new Set(insertedNodes.map((node) => node.id as string))
    );
  }, 0);
};
