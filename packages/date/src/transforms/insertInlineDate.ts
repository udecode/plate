import {
  type InsertNodesOptions,
  type PlateEditor,
  type Value,
  insertNodes,
} from '@udecode/plate-common';

import type { TInlineDateElement } from '../types';

import { ELEMENT_INLINE_DATE } from '../createInlineDatePlugin';

export const insertInlineDate = <V extends Value>(
  editor: PlateEditor<V>,
  date?: string,
  options?: InsertNodesOptions<V>
) => {
  insertNodes<{ text: string } | TInlineDateElement>(
    editor,
    [
      {
        children: [{ text: '' }],
        date: date ?? new Date().toDateString(),
        type: ELEMENT_INLINE_DATE,
      },
      {
        text: ' ',
      },
    ],
    options as any
  );
};
