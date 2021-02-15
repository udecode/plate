import { Editor } from 'slate';
import { getText } from '../../../common';
import { IndentCodeBlockLineOptions } from '../transforms/indentCodeBlockLine';

export const getIndentDepth = (
  editor: Editor,
  { codeBlockLineItem }: IndentCodeBlockLineOptions
) => {
  const [, codeBlockLinePath] = codeBlockLineItem;
  const text = getText(editor, codeBlockLinePath);
  return text.search(/\S|$/);
};
