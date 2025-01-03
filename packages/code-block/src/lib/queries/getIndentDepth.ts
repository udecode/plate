import type { TEditor } from '@udecode/plate-common';

import type { IndentCodeLineOptions } from '../transforms/indentCodeLine';

export const getIndentDepth = (
  editor: TEditor,
  { codeLine }: IndentCodeLineOptions
) => {
  const [, codeLinePath] = codeLine;
  const text = editor.api.string(codeLinePath);

  return text.search(/\S|$/);
};
