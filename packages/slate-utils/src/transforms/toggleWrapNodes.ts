import {
  type TEditor,
  type TElement,
  type Value,
  someNode,
  unwrapNodes,
  wrapNodes,
} from '@udecode/slate';

/** Unwrap if the node type is in selection. Wrap otherwise. */
export const toggleWrapNodes = <V extends Value>(
  editor: TEditor<V>,
  type: string
) => {
  if (someNode(editor, { match: { type } })) {
    unwrapNodes(editor, { match: { type } });
  } else {
    wrapNodes<TElement>(editor, {
      children: [],
      type,
    });
  }
};
