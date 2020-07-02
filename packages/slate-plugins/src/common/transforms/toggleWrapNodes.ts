import { Editor, Transforms } from 'slate';
import { isNodeTypeIn } from '../queries';
import { unwrapNodesByType } from './unwrapNodesByType';

/**
 * Unwrap if the node type is in selection.
 * Wrap otherwise.
 */
export const toggleWrapNodes = (editor: Editor, type: string) => {
  if (isNodeTypeIn(editor, type)) {
    unwrapNodesByType(editor, type);
  } else {
    Transforms.wrapNodes(editor, {
      type,
      children: [],
    });
  }
};
