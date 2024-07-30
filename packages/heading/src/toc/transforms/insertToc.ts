import {
  type InsertNodesOptions,
  type PlateEditor,
  type TElement,
  type Value,
  insertNodes,
} from '@udecode/plate-common';

import { ELEMENT_TOC } from '../TocPlugin';

export const insertToc = <V extends Value>(
  editor: PlateEditor<V>,
  options?: InsertNodesOptions<V>
) => {
  insertNodes<TElement>(
    editor,
    {
      children: [{ text: '' }],
      type: ELEMENT_TOC,
    },
    options as any
  );
};
