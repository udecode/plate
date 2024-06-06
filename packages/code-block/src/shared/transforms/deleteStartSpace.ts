import {
  type TEditor,
  type Value,
  deleteText,
  getEditorString,
  getPointAfter,
  getRange,
  getStartPoint,
} from '@udecode/plate-common/server';

import type { OutdentCodeLineOptions } from './outdentCodeLine';

/** If there is a whitespace character at the start of the code line, delete it. */
export const deleteStartSpace = <V extends Value>(
  editor: TEditor<V>,
  { codeLine }: OutdentCodeLineOptions
) => {
  const [, codeLinePath] = codeLine;
  const codeLineStart = getStartPoint(editor, codeLinePath);
  const codeLineEnd = codeLineStart && getPointAfter(editor, codeLineStart);
  const spaceRange =
    codeLineEnd && getRange(editor, codeLineStart, codeLineEnd);
  const spaceText = getEditorString(editor, spaceRange);

  if (/\s/.test(spaceText)) {
    deleteText(editor, { at: spaceRange });

    return true;
  }

  return false;
};
