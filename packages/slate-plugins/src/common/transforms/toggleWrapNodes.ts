import { Editor } from 'slate';
import { isNodeTypeIn } from '../queries';
import { unwrapNodesByType } from './unwrapNodesByType';
import { wrapNodes } from './wrapNodes';

/**
 * Unwrap if the node type is in selection.
 * Wrap otherwise.
 */
export const toggleWrapNodes = (editor: Editor, type: string) => {
  if (isNodeTypeIn(editor, type)) {
    unwrapNodesByType(editor, type);
  } else {
    wrapNodes(editor, {
      type,
      children: [],
    });
  }
};
