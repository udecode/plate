import {
  type InsertNodesOptions,
  type SlateEditor,
  insertNodes,
} from '@udecode/plate-common';

import type { TInlineEquationElement } from '../types';

import { InlineEquationPlugin } from '../InlineEquationPlugin';

export const insertInlineEquation = <E extends SlateEditor>(
  editor: E,
  texExpression?: string,
  options?: InsertNodesOptions<E>
) => {
  insertNodes<TInlineEquationElement>(
    editor,
    {
      children: [{ text: '' }],
      texExpression: texExpression ?? '',
      type: editor.getType(InlineEquationPlugin),
    },
    options as any
  );
};
