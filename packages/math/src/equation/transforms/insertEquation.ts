import {
  type InsertNodesOptions,
  type PlateEditor,
  insertNodes,
} from '@udecode/plate-common';

import type { TEquationElement } from '../types';

import { ELEMENT_EQUATION } from '../EquationPlugin';

export const insertEquation = <E extends PlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
) => {
  insertNodes<TEquationElement>(
    editor,
    {
      children: [{ text: '' }],
      texExpression: '',
      type: ELEMENT_EQUATION,
    },
    options as any
  );
};
