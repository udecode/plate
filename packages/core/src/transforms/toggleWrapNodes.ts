import { someNode } from '../queries/someNode';
import { TEditor, Value } from '../slate/editor/TEditor';
import { TElement } from '../slate/element/TElement';
import { unwrapNodes } from '../slate/transforms/unwrapNodes';
import { wrapNodes } from '../slate/transforms/wrapNodes';

/**
 * Unwrap if the node type is in selection.
 * Wrap otherwise.
 */
export const toggleWrapNodes = <V extends Value>(
  editor: TEditor<V>,
  type: string
) => {
  if (someNode(editor, { match: { type } })) {
    unwrapNodes(editor, { match: { type } });
  } else {
    wrapNodes<TElement>(editor, {
      type,
      children: [],
    });
  }
};
