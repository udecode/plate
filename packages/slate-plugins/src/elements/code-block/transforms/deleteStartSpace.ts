import { Editor, Transforms } from 'slate';
import { getText } from '../../../common';
import { OutdentCodeLineOptions } from './outdentCodeLine';

/**
 * If there is a whitespace character at the start of the code line,
 * delete it.
 */
export const deleteStartSpace = (
  editor: Editor,
  { codeLine }: OutdentCodeLineOptions
) => {
  const [, codeLinePath] = codeLine;
  const codeLineStart = Editor.start(editor, codeLinePath);
  const codeLineEnd = codeLineStart && Editor.after(editor, codeLineStart);
  const spaceRange =
    codeLineEnd && Editor.range(editor, codeLineStart, codeLineEnd);
  const spaceText = getText(editor, spaceRange);

  if (/\s/.test(spaceText)) {
    Transforms.delete(editor, { at: spaceRange });
    return true;
  }

  return false;
};
