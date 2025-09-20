import type { PlateEditor } from 'platejs/react';

import { type Path, type TElement, NodeApi, PathApi } from 'platejs';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const insertBlocksAndSelect = (
  editor: PlateEditor,
  nodes: TElement[],
  { at, insertedCallback }: { at: Path; insertedCallback?: () => void }
) => {
  editor.tf.insertNodes(nodes, { at });

  insertedCallback?.();

  const insertedNodes = [NodeApi.get<TElement>(editor, at)!];

  let count = 1;

  while (count < nodes.length) {
    at = PathApi.next(at);
    const nextNode = NodeApi.get<TElement>(editor, at)!;
    insertedNodes.push(nextNode);
    count++;
  }

  setTimeout(() => {
    editor.setOption(
      BlockSelectionPlugin,
      'selectedIds',
      new Set(insertedNodes.map((n) => n.id as string))
    );
  }, 0);
};
