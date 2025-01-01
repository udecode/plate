import type { TEditor, TElement } from '../interfaces';

import { someNode } from '../queries';

/** Unwrap if the node type is in selection. Wrap otherwise. */
export const toggleWrapNodes = (editor: TEditor, type: string) => {
  if (someNode(editor, { match: { type } })) {
    editor.tf.unwrapNodes({ match: { type } });
  } else {
    editor.tf.wrapNodes<TElement>({
      children: [],
      type,
    });
  }
};
