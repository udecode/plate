import {
  type InsertNodesOptions,
  type SlateEditor,
  type TElement,
  insertNodes,
} from '@udecode/plate-common';

import { BaseTocPlugin } from '../BaseTocPlugin';

export const insertToc = (
  editor: SlateEditor,
  options?: InsertNodesOptions
) => {
  insertNodes<TElement>(
    editor,
    {
      children: [{ text: '' }],
      type: editor.getType(BaseTocPlugin),
    },
    options as any
  );
};
