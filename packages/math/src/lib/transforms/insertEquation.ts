import type { InsertNodesOptions, SlateEditor } from '@udecode/plate';

import {
  type TEquationElement,
  BaseEquationPlugin,
} from '../BaseEquationPlugin';

export const insertEquation = (
  editor: SlateEditor,
  options?: InsertNodesOptions
) => {
  editor.tf.insertNodes<TEquationElement>(
    {
      children: [{ text: '' }],
      texExpression: '',
      type: editor.getType(BaseEquationPlugin),
    },
    options as any
  );
};
