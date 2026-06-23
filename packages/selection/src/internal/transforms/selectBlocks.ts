import type { Path, SlateEditor, TIdElement } from 'platejs';

import type { BlockSelectionConfig } from '../../react';

export const selectBlocks = (editor: SlateEditor, at: Path) => {
  const blockSelectionApi = (
    editor.api as unknown as BlockSelectionConfig['api']
  ).blockSelection;
  const blockSelection = blockSelectionApi.getNodes();

  const entry = editor.api.node<TIdElement>(at);

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

  blockSelectionApi.set(ids.includes(element.id) ? ids : [element.id]);
};
