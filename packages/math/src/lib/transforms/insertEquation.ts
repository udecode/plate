import {
  type InsertNodesOptions,
  type SlateEditor,
  insertNodes,
} from '@udecode/plate-common';

import {
  type TEquationElement,
  BaseEquationPlugin,
} from '../BaseEquationPlugin';

export const insertEquation = (
  editor: SlateEditor,
  options?: InsertNodesOptions
) => {
  insertNodes<TEquationElement>(
    editor,
    {
      children: [{ text: '' }],
      texExpression: '',
      type: editor.getType(BaseEquationPlugin),
    },
    options as any
  );
};
