import { isNodeInSelection } from 'common/queries';
import { unwrapNodesByType } from 'common/transforms/unwrapNodesByType';
import { Editor, Transforms } from 'slate';

/**
 * Unwrap if the node type is in selection.
 * Wrap otherwise.
 */
export const toggleWrapNodes = (editor: Editor, type: string) => {
  if (isNodeInSelection(editor, type)) {
    unwrapNodesByType(editor, type);
  } else {
    Transforms.wrapNodes(editor, {
      type,
      children: [],
    });
  }
};
