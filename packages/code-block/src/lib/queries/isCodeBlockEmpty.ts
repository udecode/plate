import type { BaseEditor } from '@platejs/core';
import { NodeApi } from '@platejs/plite';

import { getCodeLineEntry } from './getCodeLineEntry';

/** Is the selection inside an empty code block */
export const isCodeBlockEmpty = (editor: BaseEditor) => {
  const { codeBlock } = getCodeLineEntry(editor) ?? {};

  if (!codeBlock) return false;

  const codeLines = codeBlock[0].children;

  if (codeLines.length === 0) return true;
  if (codeLines.length > 1) return false;

  const firstCodeLineNode = codeLines[0];

  return !NodeApi.string(firstCodeLineNode);
};
