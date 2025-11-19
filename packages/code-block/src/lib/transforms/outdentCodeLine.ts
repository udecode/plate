import type { Editor, ElementEntry } from 'platejs';

import { deleteStartSpace } from './deleteStartSpace';

export type OutdentCodeLineOptions = {
  codeBlock: ElementEntry;
  codeLine: ElementEntry;
};

/** Outdent the code line. Remove 2 whitespace characters if any. */
export const outdentCodeLine = (
  editor: Editor,
  { codeBlock, codeLine }: OutdentCodeLineOptions
) => {
  const deleted = deleteStartSpace(editor, { codeBlock, codeLine });
  if (deleted) {
    deleteStartSpace(editor, { codeBlock, codeLine });
  }
};
