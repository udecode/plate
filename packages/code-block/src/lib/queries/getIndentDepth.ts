import type { SlateEditor } from 'platejs';

import type { IndentCodeLineOptions } from '../transforms/indentCodeLine';

const nonWhitespaceOrEndRegex = /\S|$/;

export const getIndentDepth = (
  editor: SlateEditor,
  { codeLine }: IndentCodeLineOptions
) => {
  const [, codeLinePath] = codeLine;
  const text = editor.api.string(codeLinePath);

  return text.search(nonWhitespaceOrEndRegex);
};
