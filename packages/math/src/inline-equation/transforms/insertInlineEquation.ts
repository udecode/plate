import {
  type InsertNodesOptions,
  type PlateEditor,
  type ValueOf,
  insertNodes,
} from '@udecode/plate-common';

import type { TInlineEquationElement } from '../types';

import { ELEMENT_INLINE_EQUATION } from '../InlineEquationPlugin';

export const insertInlineEquation = <E extends PlateEditor>(
  editor: E,
  texExpression?: string,
  options?: InsertNodesOptions<ValueOf<E>>
) => {
  insertNodes<TInlineEquationElement>(
    editor,
    {
      children: [{ text: '' }],
      texExpression: texExpression ?? '',
      type: ELEMENT_INLINE_EQUATION,
    },
    options as any
  );
};
