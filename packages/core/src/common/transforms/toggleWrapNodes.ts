import { unwrapNodes } from '../../slate/transforms/unwrapNodes';
import { wrapNodes } from '../../slate/transforms/wrapNodes';
import { TEditor, Value } from '../../slate/types/TEditor';
import { EElement } from '../../slate/types/TElement';
import { someNode } from '../queries/someNode';

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
    wrapNodes(editor, {
      type,
      children: [],
    } as EElement<V>);
  }
};
