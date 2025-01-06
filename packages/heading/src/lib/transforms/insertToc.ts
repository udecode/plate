import type { InsertNodesOptions, SlateEditor, TElement } from '@udecode/plate';

import { BaseTocPlugin } from '../BaseTocPlugin';

export const insertToc = (
  editor: SlateEditor,
  options?: InsertNodesOptions
) => {
  editor.tf.insertNodes<TElement>(
    {
      children: [{ text: '' }],
      type: editor.getType(BaseTocPlugin),
    },
    options as any
  );
};
