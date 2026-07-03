import {
  type Descendant,
  type Element as PliteElement,
  ElementApi,
  NodeApi,
} from '@platejs/plite';

import type { BaseEditor } from '../../lib';

export const getSelectedDomFragment = (editor: BaseEditor): Descendant[] => {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return [];

  const range = selection.getRangeAt(0);
  const fragment = range.cloneContents();

  const domBlocks = Array.from(
    fragment.querySelectorAll('[data-plite-node="element"][data-plite-id]')
  );

  if (domBlocks.length === 0) return [];

  const nodes: Descendant[] = [];

  domBlocks.forEach((node, index) => {
    const blockId = (node as HTMLElement).dataset.pliteId;
    const block = editor.read((state) =>
      state.nodes.find<PliteElement>({
        at: [],
        match: (n): n is PliteElement =>
          ElementApi.isElement(n) && n.id === blockId,
      })
    );

    // prevent inline elements like link and table cells.
    if (!block || block[1].length !== 1) return;

    /**
     * If the selection don't cover the all first or last block, we need
     * fallback to deserialize the block to get the correct fragment
     */
    if (
      (index === 0 || index === domBlocks.length - 1) &&
      node.textContent?.trim() !== NodeApi.string(block[0]) &&
      ElementApi.isElement(block[0]) &&
      !editor.read.schema.isVoid(block[0])
    ) {
      const html = document.createElement('div');
      html.append(node);
      const results = editor.api.html.deserialize({ element: html });
      const [firstResult] = results;

      if (!firstResult) return;

      if (ElementApi.isElement(firstResult)) {
        nodes.push(firstResult);

        return;
      }

      const { children: _children, id: _id, ...blockProps } = block[0];

      nodes.push({
        ...blockProps,
        children: results,
      });
    } else {
      nodes.push(block[0]);
    }
  });

  return nodes;
};
