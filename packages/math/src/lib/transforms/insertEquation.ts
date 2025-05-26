import type {
  InsertNodesOptions,
  SlateEditor,
  TEquationElement,
} from '@udecode/plate';

import { KEYS } from '@udecode/plate';

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
