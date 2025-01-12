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

  console.log(nodes.length);

  while (count < nodes.length) {
    const nextNode = NodeApi.get<TElement>(editor, PathApi.next(at))!;
    insertedNodes.push(nextNode);
    count++;
  }

  console.log(insertedNodes.map((n) => n.id));

  setTimeout(() => {
    editor.getApi(BlockSelectionPlugin).blockSelection.setSelectedIds({
      ids: insertedNodes.map((n) => n.id),
    } as any);
  }, 0);
};
