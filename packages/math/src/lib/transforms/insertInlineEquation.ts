import {
  type InsertNodesOptions,
  type SlateEditor,
  getSelectionText,
} from '@udecode/plate-common';

import type { TEquationElement } from '../BaseEquationPlugin';

import { BaseInlineEquationPlugin } from '../BaseInlineEquationPlugin';

export const insertInlineEquation = (
  editor: SlateEditor,
  texExpression?: string,
  options?: InsertNodesOptions
) => {
  editor.tf.insertNodes<TEquationElement>(
    {
      children: [{ text: '' }],
      texExpression: texExpression ?? getSelectionText(editor),
      type: editor.getType(BaseInlineEquationPlugin),
    },
    options as any
  );
};
