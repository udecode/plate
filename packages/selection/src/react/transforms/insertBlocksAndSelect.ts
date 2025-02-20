import type { PlateEditor } from '@udecode/plate/react';

import { type Path, type TElement, NodeApi, PathApi } from '@udecode/plate';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const insertBlocksAndSelect = (
  editor: PlateEditor,
  nodes: TElement[],
  { at }: { at: Path }
) => {
  editor.tf.insertNodes(nodes, { at });

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
