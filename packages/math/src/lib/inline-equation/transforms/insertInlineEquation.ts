import {
  type InsertNodesOptions,
  type SlateEditor,
  insertNodes,
} from '@udecode/plate-common';

import type { TInlineEquationElement } from '../types';

import { BaseInlineEquationPlugin } from '../BaseInlineEquationPlugin';

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
      type: editor.getType(BaseInlineEquationPlugin),
    },
    options as any
  );
};
