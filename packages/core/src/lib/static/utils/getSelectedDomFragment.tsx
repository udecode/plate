import { type Descendant, NodeApi } from "@platejs/slate";

import type { SlateEditor } from "../../editor";

export const getSelectedDomFragment = (editor: SlateEditor): Descendant[] => {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return [];

  const range = selection.getRangeAt(0);
  const fragment = range.cloneContents();

  const _domBlocks = fragment.querySelectorAll(
    '[data-slate-node="element"][data-slate-id]'
  );

  const domBlocks = Array.from(_domBlocks);


  if (domBlocks.length === 0) return [];

  const nodes: Descendant[] = [];

  domBlocks.forEach((node, index) => {
    const blockId = (node as HTMLElement).dataset.slateId;
    const block = editor.api.node({ id: blockId, at: [] });

    // prevent inline elements like link and table cells.
    if (!block || block[1].length === 1) return


    /**
     * If the selection don't cover the all first or last block, we
     * need fallback to deserialize the block to get the correct
     * fragment
     */
    if (
      (index === 0 || index === domBlocks.length - 1) &&
      node.textContent?.trim() !== NodeApi.string(block[0])
    ) {
      const html = document.createElement('div');
      html.append(node);
      const results = editor.api.html.deserialize({ element: html });
      nodes.push(results[0]);
    } else {
      nodes.push(block[0]);
    }
  });


  return nodes;
};
