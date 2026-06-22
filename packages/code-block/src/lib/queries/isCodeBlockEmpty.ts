import type { SlateEditor } from 'platejs';
import { NodeApi } from '@platejs/slate';

import { getCodeLineEntry } from './getCodeLineEntry';

/** Is the selection inside an empty code block */
export const isCodeBlockEmpty = (editor: SlateEditor) => {
  const { codeBlock } = getCodeLineEntry(editor) ?? {};

  if (!codeBlock) return false;

  const [codeBlockNode] = codeBlock;
  const codeLines = codeBlockNode.children;

  if (codeLines.length === 0) return true;
  if (codeLines.length > 1) return false;

  const firstCodeLineNode = codeLines[0];

  return !NodeApi.string(firstCodeLineNode);
};
