import { TNode } from '@udecode/plate-core';
import { Path } from 'slate';
import { ReactEditor } from 'slate-react';

/**
 * @see {@link ReactEditor.findPath}
 */
export const findNodePath = (
  editor: ReactEditor,
  node: TNode
): Path | undefined => {
  try {
    return ReactEditor.findPath(editor, node);
  } catch (e) {}
};
