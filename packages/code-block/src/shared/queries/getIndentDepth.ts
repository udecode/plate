import { type TEditor, getEditorString } from '@udecode/plate-common/server';

import type { IndentCodeLineOptions } from '../transforms/indentCodeLine';

export const getIndentDepth = (
  editor: TEditor,
  { codeLine }: IndentCodeLineOptions
) => {
  const [, codeLinePath] = codeLine;
  const text = getEditorString(editor, codeLinePath);

  return text.search(/\S|$/);
};
