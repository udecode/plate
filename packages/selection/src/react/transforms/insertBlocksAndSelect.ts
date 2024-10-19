import type { PlateEditor } from '@udecode/plate-common/react';
import type { Path } from 'slate';

import { type TElement, insertNodes, nanoid } from '@udecode/plate-common';

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

  insertNodes(editor, nodes, { at: at });

  setTimeout(() => {
    editor
      .getApi(BlockSelectionPlugin)
      .blockSelection.setSelectedIds({ ids } as any);
  }, 0);
};
