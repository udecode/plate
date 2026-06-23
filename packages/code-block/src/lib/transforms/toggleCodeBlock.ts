import type { ElementEntry, SlateEditor } from 'platejs';

import { ElementApi, KEYS } from 'platejs';

export const toggleCodeBlock = (editor: SlateEditor) => {
  if (!editor.selection) return;

  const codeBlockType = editor.getType(KEYS.codeBlock);
  const codeLineType = editor.getType(KEYS.codeLine);

  const isActive = editor.api.some({
    match: { type: codeBlockType },
  });
  const codeBlockEntries = Array.from(
    editor.api.nodes({
      at: editor.selection,
      match: (node) =>
        ElementApi.isElement(node) && node.type === codeBlockType,
    })
  ).reverse() as ElementEntry[];

  editor.update((tx) => {
    for (const [codeBlockNode, codeBlockPath] of codeBlockEntries) {
      codeBlockNode.children.forEach((_, index) => {
        tx.nodes.set(
          { type: editor.getType(KEYS.p) },
          { at: [...codeBlockPath, index] }
        );
      });
      tx.nodes.unwrap({
        at: codeBlockPath,
        match: (node) =>
          ElementApi.isElement(node) && node.type === codeBlockType,
        split: true,
      });
    }
    if (!isActive) {
      tx.nodes.set({
        type: codeLineType,
      });

      const codeBlock = {
        children: [],
        type: codeBlockType,
      };

      tx.nodes.wrap(codeBlock);
    }
  });
};
