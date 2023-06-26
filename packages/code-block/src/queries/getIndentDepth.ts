import { getEditorString, TEditor, Value } from '@udecode/plate-common';
import { IndentCodeLineOptions } from '../transforms/indentCodeLine';

export const getIndentDepth = <V extends Value>(
  editor: TEditor<V>,
  { codeLine }: IndentCodeLineOptions
) => {
  const [, codeLinePath] = codeLine;
  const text = getEditorString(editor, codeLinePath);
  return text.search(/\S|$/);
};
