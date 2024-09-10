import {
  type TEditor,
  type TElement,
  someNode,
  unwrapNodes,
  wrapNodes,
} from '@udecode/slate';

/** Unwrap if the node type is in selection. Wrap otherwise. */
export const toggleWrapNodes = (editor: TEditor, type: string) => {
  if (someNode(editor, { match: { type } })) {
    unwrapNodes(editor, { match: { type } });
  } else {
    wrapNodes<TElement>(editor, {
      children: [],
      type,
    });
  }
};
