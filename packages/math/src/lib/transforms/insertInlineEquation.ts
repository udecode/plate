import type {
  InsertNodesOptions,
  SlateEditor,
  TEquationElement,
} from 'platejs';

import { KEYS } from 'platejs';

export const insertInlineEquation = (
  editor: SlateEditor,
  texExpression?: string,
  options?: InsertNodesOptions
) => {
  editor.tf.insertNodes<TEquationElement>(
    {
      children: [{ text: '' }],
      texExpression: texExpression ?? editor.api.string(editor.selection),
      type: editor.getType(KEYS.inlineEquation),
    },
    options as any
  );
};
