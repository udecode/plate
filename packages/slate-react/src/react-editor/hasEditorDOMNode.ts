import type { TEditor } from '@udecode/slate';
import type { DOMNode } from 'slate-dom';

import { ReactEditor } from 'slate-react';

/** Check if a DOM node is within the editor. */
export const hasEditorDOMNode = (
  editor: TEditor,
  target: DOMNode,
  options?: Parameters<typeof ReactEditor.hasDOMNode>[2]
) => {
  try {
    return ReactEditor.hasDOMNode(editor as any, target, options);
  } catch (error) {}

  return false;
};
