import type { InsertNodesOptions, SlateEditor, TElement } from 'platejs';

import { KEYS } from 'platejs';

export const insertToc = (
  editor: SlateEditor,
  options?: InsertNodesOptions
) => {
  editor.tf.insertNodes<TElement>(
    {
      children: [{ text: '' }],
      type: editor.getType(KEYS.toc),
    },
    options as any
  );
};
