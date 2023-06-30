import {
  PlateEditor,
  Value,
  getChildren,
  getNodeString,
} from '@udecode/plate-common';

import { getCodeLineEntry } from './getCodeLineEntry';

/**
 * Is the selection inside an empty code block
 */
export const isCodeBlockEmpty = <V extends Value>(editor: PlateEditor<V>) => {
  const { codeBlock } = getCodeLineEntry(editor) ?? {};
  if (!codeBlock) return false;

  const codeLines = Array.from(getChildren(codeBlock));
  if (codeLines.length === 0) return true;
  if (codeLines.length > 1) return false;

  const firstCodeLineNode = codeLines[0][0];
  return !getNodeString(firstCodeLineNode);
};
