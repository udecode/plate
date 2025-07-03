import type { Descendant } from "@platejs/slate";

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

  if (domBlocks.length > 0) {
    const fragment: Descendant[] = [];

    domBlocks.forEach((node: any) => {
      const blockId = node.dataset.slateId;
      const block = editor.api.node({ id: blockId, at: [] });

      // prevent inline elements like link and table cells.
      if (block && block[1].length === 1) {
        fragment.push(block[0]);
      }
    });

    return fragment;
  }

  return []
};
