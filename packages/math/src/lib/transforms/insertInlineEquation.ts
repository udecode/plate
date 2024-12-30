import {
  type InsertNodesOptions,
  type SlateEditor,
  getSelectionText,
  insertNodes,
} from '@udecode/plate-common';

import type { TEquationElement } from '../BaseEquationPlugin';

import { BaseInlineEquationPlugin } from '../BaseInlineEquationPlugin';

export const insertInlineEquation = (
  editor: SlateEditor,
  texExpression?: string,
  options?: InsertNodesOptions
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
