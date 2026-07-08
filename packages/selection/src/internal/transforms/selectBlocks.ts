import type { BaseEditor } from '@platejs/core';
import type { Node, Path } from '@platejs/plite';
import type { TIdElement } from '@platejs/utils';

import { PathApi } from '@platejs/plite';

import { BlockSelectionPlugin } from '../../react/BlockSelectionPlugin';

export const selectBlocks = (editor: BaseEditor, at: Path | Node) => {
  const { api } = editor.plugin(BlockSelectionPlugin);
  const blockSelection = api.blockSelection.getNodes();
  const entry = PathApi.isPath(at)
    ? editor.read.nodes.get<TIdElement>(at)
    : (() => {
        const path = editor.read.nodes.pathOf(at);

        return path ? editor.read.nodes.get<TIdElement>(path) : undefined;
      })();

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

  api.blockSelection.set(ids.includes(element.id) ? ids : [element.id]);
};
