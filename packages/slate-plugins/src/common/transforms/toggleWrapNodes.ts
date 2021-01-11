import { Editor } from 'slate';
import { hasNodeByType } from '../queries';
import { unwrapNodesByType } from './unwrapNodesByType';
import { wrapNodes } from './wrapNodes';

/**
 * Unwrap if the node type is in selection.
 * Wrap otherwise.
 */
export const toggleWrapNodes = (editor: Editor, type: string) => {
  if (hasNodeByType(editor, type)) {
    unwrapNodesByType(editor, type);
  } else {
    wrapNodes(editor, {
      type,
      children: [],
    });
  }
};
