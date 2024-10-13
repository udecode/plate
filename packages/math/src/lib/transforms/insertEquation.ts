import {
  type InsertNodesOptions,
  type SlateEditor,
  insertNodes,
} from '@udecode/plate-common';

import {
  type TEquationElement,
  BaseEquationPlugin,
} from '../BaseEquationPlugin';

export const insertEquation = <E extends SlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
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
