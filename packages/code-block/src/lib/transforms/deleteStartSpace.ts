import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction } from '@platejs/plite';

import type { OutdentCodeLineOptions } from './outdentCodeLine';

const whitespaceRegex = /\s/;

/** If there is a whitespace character at the start of the code line, delete it. */
export const deleteStartSpace = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  { codeLine }: OutdentCodeLineOptions
) => {
  const [, codeLinePath] = codeLine;
  const codeLineStart = editor.read.points.start(codeLinePath);
  const codeLineEnd = codeLineStart && editor.read.points.after(codeLineStart);
  const spaceRange =
    codeLineEnd && editor.read.ranges.get(codeLineStart, codeLineEnd);
  const spaceText = spaceRange ? editor.read.text.string(spaceRange) : '';

  if (whitespaceRegex.test(spaceText)) {
    tx.text.delete({ at: spaceRange });

    return true;
  }

  return false;
};
