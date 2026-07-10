import type { BaseEditor } from '@platejs/core';
import type { Path } from '@platejs/plite';
import type { TIdElement } from '@platejs/utils';

import { BlockSelectionPlugin } from '../../react/BlockSelectionPlugin';

export const selectBlocks = (editor: BaseEditor, at: Path | TIdElement) => {
  const { api } = editor.plugin(BlockSelectionPlugin);
  const blockSelection = api.getNodes();
  const entry = editor.read.nodes.get<TIdElement>(at);

  if (!entry) return;

  const [element, path] = entry;
  const selectedBlocks =
    blockSelection.length > 0
      ? blockSelection
      : editor.read.nodes.toArray<TIdElement>({
          mode: 'lowest',
          match: (_, p) => p.length === path.length,
        });
  const ids = selectedBlocks.map(([block]) => block.id as string);

  api.set(ids.includes(element.id) ? ids : [element.id]);
};
