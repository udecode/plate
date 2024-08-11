import {
  type InsertNodesOptions,
  type PlateEditor,
  type TElement,
  type ValueOf,
  insertNodes,
} from '@udecode/plate-common';

import { ELEMENT_TOC } from '../TocPlugin';

export const insertToc = <E extends PlateEditor>(
  editor: E,
  options?: InsertNodesOptions<ValueOf<E>>
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
