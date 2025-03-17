import type { Path, SlateEditor, TElement, TNode } from '@udecode/plate';

import { BlockSelectionPlugin } from '../../react';

export const selectBlocks = (editor: SlateEditor, at: Path | TNode) => {
  const blockSelection = editor
    .getApi(BlockSelectionPlugin)
    .blockSelection.getNodes();

  const entry = editor.api.node<TElement & { id: string }>(at);

  if (!entry) return;

  const [element, path] = entry;

  const selectedBlocks =
    blockSelection.length > 0
      ? blockSelection
      : editor.api.blocks({
          mode: 'lowest',
          match: (_, p) => p.length === path.length,
        });
  const ids = selectedBlocks.map((block) => block[0].id as string);

  editor
    .getApi(BlockSelectionPlugin)
    .blockSelection.set(ids.includes(element.id) ? ids : [element.id]);
};
