import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction, ElementEntry } from '@platejs/plite';

import { deleteStartSpace } from './deleteStartSpace';

export type OutdentCodeLineOptions = {
  codeBlock: ElementEntry;
  codeLine: ElementEntry;
};

/** Outdent the code line. Remove 2 whitespace characters if any. */
export const outdentCodeLine = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  { codeBlock, codeLine }: OutdentCodeLineOptions
) => {
  const deleted = deleteStartSpace(editor, tx, { codeBlock, codeLine });
  if (deleted) {
    deleteStartSpace(editor, tx, { codeBlock, codeLine });
  }
};
