import type { Path } from 'slate';

import { type TEditor, type Value, getNodeEntry } from '@udecode/slate';

/** Get the top-level block. */
export const getAncestorNode = <V extends Value = Value>(
  editor: TEditor<V>,
  path?: Path
) => {
  const { selection } = editor;

  const at = path ? path[0] : selection?.focus?.path[0];

  if (typeof at !== 'number') return;

  return getNodeEntry(editor, [at]);
};
