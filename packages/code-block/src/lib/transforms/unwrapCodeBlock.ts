import type { Location, Path } from '@platejs/slate';

import { type SlateEditor, ElementApi, KEYS } from 'platejs';

export const unwrapCodeBlock = (editor: SlateEditor) => {
  if (!editor.selection) return;

  const codeBlockType = editor.getType(KEYS.codeBlock);
  const defaultType = editor.getType(KEYS.p);

  const codeBlockEntries = editor.api.nodes({
    at: editor.selection as Location,
    match: { type: codeBlockType },
  });

  const reversedCodeBlockEntries = Array.from(codeBlockEntries).reverse();

  editor.update((tx) => {
    for (const codeBlockEntry of reversedCodeBlockEntries) {
      const [codeBlockNode, codeBlockPath] = codeBlockEntry;

      if (!ElementApi.isElement(codeBlockNode)) continue;

      for (const [index] of codeBlockNode.children.entries()) {
        const path = [...codeBlockPath, index] as Path;
        tx.nodes.set({ type: defaultType }, { at: path });
      }

      tx.nodes.unwrap({
        at: codeBlockPath,
        match: (node) =>
          ElementApi.isElement(node) && node.type === codeBlockType,
        split: true,
      });
    }
  });
};
