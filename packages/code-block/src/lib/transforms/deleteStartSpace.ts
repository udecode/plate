import type { EditorUpdateTransaction } from '@platejs/plite';

import type { OutdentCodeLineOptions } from './outdentCodeLine';

const whitespaceRegex = /\s/;

/** If there is a whitespace character at the start of the code line, delete it. */
export const deleteStartSpace = (
  tx: EditorUpdateTransaction,
  { codeLine }: OutdentCodeLineOptions
) => {
  const [, codeLinePath] = codeLine;
  const codeLineStart = tx.points.start(codeLinePath);
  const codeLineEnd = codeLineStart && tx.points.after(codeLineStart);
  const spaceRange = codeLineEnd && tx.ranges.get(codeLineStart, codeLineEnd);
  const spaceText = spaceRange ? tx.text.string(spaceRange) : '';

  if (whitespaceRegex.test(spaceText)) {
    tx.text.delete({ at: spaceRange });

    return true;
  }

  return false;
};
