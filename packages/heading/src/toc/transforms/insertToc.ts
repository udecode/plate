import {
  type InsertNodesOptions,
  type PlateEditor,
  type TElement,
  insertNodes,
} from '@udecode/plate-common';

import { TocPlugin } from '../TocPlugin';

export const insertToc = <E extends PlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
) => {
  insertNodes<TElement>(
    editor,
    {
      children: [{ text: '' }],
      type: editor.getType(TocPlugin),
    },
    options as any
  );
};
