import type { PlateEditor } from '@udecode/plate-common/react';
import type { Path } from 'slate';

import { type TElement, nanoid } from '@udecode/plate-common';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const insertBlocksAndSelect = (
  editor: PlateEditor,
  nodes: TElement[],
  { at }: { at: Path }
) => {
  const ids: string[] = [];

  nodes.forEach((node) => {
    const id = nanoid();
    ids.push(id);
    node.id = id;
  });

  editor.tf.insertNodes(nodes, { at: at });

  setTimeout(() => {
    editor
      .getApi(BlockSelectionPlugin)
      .blockSelection.setSelectedIds({ ids } as any);
  }, 0);
};
