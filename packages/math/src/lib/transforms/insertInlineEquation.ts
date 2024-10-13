import {
  type InsertNodesOptions,
  type SlateEditor,
  getSelectionText,
  insertNodes,
} from '@udecode/plate-common';

import type { TEquationElement } from '../BaseEquationPlugin';

import { BaseInlineEquationPlugin } from '../BaseInlineEquationPlugin';

export const insertInlineEquation = <E extends SlateEditor>(
  editor: E,
  texExpression?: string,
  options?: InsertNodesOptions<E>
) => {
  insertNodes<TEquationElement>(
    editor,
    {
      children: [{ text: '' }],
      texExpression: texExpression ?? getSelectionText(editor),
      type: editor.getType(BaseInlineEquationPlugin),
    },
    options as any
  );
};
