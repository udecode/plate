import type { Path } from 'slate';

import { type TEditor, getNodeEntry } from '@udecode/slate';

/** Get the top-level block. */
export const getAncestorNode = (editor: TEditor, path?: Path) => {
  const { selection } = editor;

  const at = path ? path[0] : selection?.focus?.path[0];

  if (typeof at !== 'number') return;

  return getNodeEntry(editor, [at]);
};
