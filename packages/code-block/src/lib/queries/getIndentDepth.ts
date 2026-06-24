import type { BasePlateEditor } from 'platejs';

import type { IndentCodeLineOptions } from '../transforms/indentCodeLine';

const nonWhitespaceOrEndRegex = /\S|$/;

export const getIndentDepth = (
  editor: BasePlateEditor,
  { codeLine }: IndentCodeLineOptions
) => {
  const [, codeLinePath] = codeLine;
  const text = editor.api.string(codeLinePath);

  return text.search(nonWhitespaceOrEndRegex);
};
