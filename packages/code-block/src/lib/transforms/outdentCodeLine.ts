import type { EditorUpdateTransaction, ElementEntry } from '@platejs/plite';

import { deleteStartSpace } from './deleteStartSpace';

export type OutdentCodeLineOptions = {
  codeBlock: ElementEntry;
  codeLine: ElementEntry;
};

/** Outdent the code line. Remove 2 whitespace characters if any. */
export const outdentCodeLine = (
  tx: EditorUpdateTransaction,
  { codeBlock, codeLine }: OutdentCodeLineOptions
) => {
  const deleted = deleteStartSpace(tx, { codeBlock, codeLine });
  if (deleted) {
    deleteStartSpace(tx, { codeBlock, codeLine });
  }
};
