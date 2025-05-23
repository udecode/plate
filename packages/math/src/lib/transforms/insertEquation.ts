import type { InsertNodesOptions, SlateEditor } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

import type { TEquationElement } from '../BaseEquationPlugin';

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
