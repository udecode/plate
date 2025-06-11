import type {
  InsertNodesOptions,
  SlateEditor,
  TEquationElement,
} from 'platejs';

import { KEYS } from 'platejs';

export const insertEquation = (
  editor: SlateEditor,
  options?: InsertNodesOptions
) => {
  editor.tf.insertNodes<TEquationElement>(
    {
      children: [{ text: '' }],
      texExpression: '',
      type: editor.getType(KEYS.equation),
    },
    options as any
  );
};
