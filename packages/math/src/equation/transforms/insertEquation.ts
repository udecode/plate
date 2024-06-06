import {
  type InsertNodesOptions,
  type PlateEditor,
  type Value,
  insertNodes,
} from '@udecode/plate-common';

import type { TEquationElement } from '../types';

import { ELEMENT_EQUATION } from '../createEquationPlugin';

export const insertEquation = <V extends Value>(
  editor: PlateEditor<V>,
  options?: InsertNodesOptions<V>
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
