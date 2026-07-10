import type { BaseEditor } from '@platejs/core';
import { type ElementOf, ElementApi, type Location } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/** Return the current code line and its parent code block. */
export const getCodeLineEntry = <N extends ElementOf<E>, E extends BaseEditor>(
  editor: E,
  { at = editor.read.selection() }: { at?: Location | null } = {}
) => {
  if (!at) return;

  const codeLine = editor.read.nodes.above<N>({
    at,
    match: (node): node is N =>
      ElementApi.isElement<N>(node) &&
      node.type === editor.getType(KEYS.codeLine),
  });

  if (!codeLine) return;

  const codeBlock = editor.read.nodes.parent<N>(codeLine[1]);

  if (
    !codeBlock ||
    !ElementApi.isElement(codeBlock[0]) ||
    codeBlock[0].type !== editor.getType(KEYS.codeBlock)
  ) {
    return;
  }

  return {
    codeBlock,
    codeLine,
  };
};
