import { Editor, Transforms } from 'slate';
import { isNodeInSelection } from '../queries';
import { unwrapNodesByType } from './unwrapNodesByType';

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
