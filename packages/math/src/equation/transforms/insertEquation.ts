import {
  type InsertNodesOptions,
  type SlateEditor,
  insertNodes,
} from '@udecode/plate-common';

import type { TEquationElement } from '../types';

import { EquationPlugin } from '../EquationPlugin';

export const insertEquation = <E extends SlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
) => {
  insertNodes<TEquationElement>(
    editor,
    {
      children: [{ text: '' }],
      texExpression: '',
      type: editor.getType(EquationPlugin),
    },
    options as any
  );
};
