import type { InsertNodesOptions, SlateEditor } from '@udecode/plate';

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
      texExpression: texExpression ?? editor.api.string(editor.selection),
      type: editor.getType(BaseInlineEquationPlugin),
    },
    options as any
  );
};
