import type { BaseEditor } from '@platejs/core';
import {
  type EditorUpdateTransaction,
  ElementApi,
  type Element,
  type Location,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const unwrapCodeBlock = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  { at = tx.selection() ?? undefined }: { at?: Location } = {}
) => {
  if (!at) return;

  const codeBlockType = editor.getType(KEYS.codeBlock);
  const defaultType = editor.getType(KEYS.p);

  tx.withoutNormalizing(() => {
    const codeBlockEntries = editor.read.nodes.entries<Element>({
      at,
      match: { type: codeBlockType },
    });

    const reversedCodeBlockEntries = Array.from(codeBlockEntries).reverse();

    for (const [codeBlock, codeBlockPath] of reversedCodeBlockEntries) {
      codeBlock.children.forEach((child, index) => {
        if (!ElementApi.isElement(child)) return;

        tx.nodes.set(
          { type: defaultType },
          { at: codeBlockPath.concat(index) }
        );
      });

      tx.nodes.unwrap({
        at: codeBlockPath,
        match: { type: codeBlockType },
      });
    }
  });
};
