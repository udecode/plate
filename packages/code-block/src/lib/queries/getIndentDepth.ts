import type { BaseEditor } from '@platejs/core';

import type { IndentCodeLineOptions } from '../transforms/indentCodeLine';

const nonWhitespaceOrEndRegex = /\S|$/;

export const getIndentDepth = (
  editor: BaseEditor,
  { codeLine }: IndentCodeLineOptions
) => {
  const [, codeLinePath] = codeLine;
  const text = editor.read.text.string(codeLinePath);

  return text.search(nonWhitespaceOrEndRegex);
};
