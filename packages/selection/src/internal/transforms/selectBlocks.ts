import type { Path, BasePlateEditor, TIdElement } from 'platejs';

import type { BlockSelectionConfig } from '../../react';

export const selectBlocks = (editor: BasePlateEditor, at: Path) => {
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
      : editor.read((state) => [
          ...state.nodes.entries<TIdElement>({
            mode: 'lowest',
            match: (node, nodePath) =>
              typeof (node as TIdElement).id === 'string' &&
              nodePath.length === path.length,
          }),
        ]);
  const ids = selectedBlocks.map((block) => block[0].id as string);

  blockSelectionApi.set(ids.includes(element.id) ? ids : [element.id]);
};
