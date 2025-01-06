import type { Path } from 'slate';

import type { ChildOf, Editor } from '../../interfaces';

export const getHighestBlock = <
  N extends ChildOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  path?: Path
) => {
  const { selection } = editor;

  const at = path ? path[0] : selection?.focus?.path[0];

  if (typeof at !== 'number') return;

  return editor.api.node<N>([at]);
};
