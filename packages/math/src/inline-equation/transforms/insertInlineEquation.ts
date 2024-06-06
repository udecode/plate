import {
  type InsertNodesOptions,
  type PlateEditor,
  type Value,
  insertNodes,
} from '@udecode/plate-common';

import type { TInlineEquationElement } from '../types';

import { ELEMENT_INLINE_EQUATION } from '../createInlineEquationPlugin';

export const insertInlineEquation = <V extends Value>(
  editor: PlateEditor<V>,
  options?: InsertNodesOptions<V>
) => {
  insertNodes<TInlineEquationElement>(
    editor,
    {
      children: [{ text: '' }],
      texExpression: '',
      type: ELEMENT_INLINE_EQUATION,
    },
    options as any
  );
};
