import { TEditor } from '../../types/slate/TEditor';
import { someNode } from '../queries/someNode';
import { unwrapNodes } from './unwrapNodes';
import { wrapNodes } from './wrapNodes';

/**
 * Unwrap if the node type is in selection.
 * Wrap otherwise.
 */
export const toggleWrapNodes = (editor: TEditor, type: string) => {
  if (someNode(editor, { match: { type } })) {
    unwrapNodes(editor, { match: { type } });
  } else {
    wrapNodes(editor, {
      type,
      children: [],
    });
  }
};
