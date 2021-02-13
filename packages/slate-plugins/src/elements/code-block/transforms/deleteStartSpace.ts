import { Editor, Transforms } from 'slate';
import { getText } from '../../../common';
import { OutdentCodeBlockLineOptions } from './outdentCodeBlockLine';

export const deleteStartSpace = (
  editor: Editor,
  { codeBlockLineItem }: OutdentCodeBlockLineOptions
) => {
  const [, codeBlockLinePath] = codeBlockLineItem;
  const codeBlockLineStart = Editor.start(editor, codeBlockLinePath);
  const codeBlockLineEnd =
    codeBlockLineStart && Editor.after(editor, codeBlockLineStart);
  const spaceRange =
    codeBlockLineEnd &&
    Editor.range(editor, codeBlockLineStart, codeBlockLineEnd);
  const spaceText = getText(editor, spaceRange);
  if (spaceText === ' ') {
    Transforms.delete(editor, { at: spaceRange });
    return true;
  }
  return false;
};
