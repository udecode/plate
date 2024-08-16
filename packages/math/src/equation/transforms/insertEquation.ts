import {
  type InsertNodesOptions,
  type PlateEditor,
  insertNodes,
} from '@udecode/plate-common';

import type { TEquationElement } from '../types';

import { EquationPlugin } from '../EquationPlugin';

export const insertEquation = <E extends PlateEditor>(
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
