import type { TEditor, TElement } from '../interfaces';

/** Unwrap if the node type is in selection. Wrap otherwise. */
export const toggleWrapNodes = (editor: TEditor, type: string) => {
  if (editor.api.some({ match: { type } })) {
    editor.tf.unwrapNodes({ match: { type } });
  } else {
    editor.tf.wrapNodes<TElement>({
      children: [],
      type,
    });
  }
};
