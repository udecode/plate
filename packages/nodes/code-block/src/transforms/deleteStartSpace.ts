import {
  deleteText,
  getPointAfter,
  getRange,
  getStartPoint,
  getText,
  TEditor,
} from '@udecode/plate-core';
import { Editor } from 'slate';
import { OutdentCodeLineOptions } from './outdentCodeLine';

/**
 * If there is a whitespace character at the start of the code line,
 * delete it.
 */
export const deleteStartSpace = (
  editor: TEditor,
  { codeLine }: OutdentCodeLineOptions
) => {
  const [, codeLinePath] = codeLine;
  const codeLineStart = getStartPoint(editor, codeLinePath);
  const codeLineEnd = codeLineStart && getPointAfter(editor, codeLineStart);
  const spaceRange =
    codeLineEnd && getRange(editor, codeLineStart, codeLineEnd);
  const spaceText = getText(editor, spaceRange);

  if (/\s/.test(spaceText)) {
    deleteText(editor, { at: spaceRange });
    return true;
  }

  return false;
};
