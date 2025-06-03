import type { InsertNodesOptions, SlateEditor, TElement } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

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
