import { getText } from '@udecode/plate-common';
import { TEditor } from '@udecode/plate-core';
import { IndentCodeLineOptions } from '../transforms/indentCodeLine';

export const getIndentDepth = (
  editor: TEditor,
  { codeLine }: IndentCodeLineOptions
) => {
  const [, codeLinePath] = codeLine;
  const text = getText(editor, codeLinePath);
  return text.search(/\S|$/);
};
