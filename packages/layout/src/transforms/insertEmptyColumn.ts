import type { ValueOf } from '@udecode/plate-common';

import {
  ELEMENT_DEFAULT,
  type InsertNodesOptions,
  type PlateEditor,
  getQueryOptions,
  insertNodes,
} from '@udecode/plate-common';

import type { TColumnElement } from '../types';

import { ELEMENT_COLUMN } from '../ColumnPlugin';

export const insertEmptyColumn = <E extends PlateEditor>(
  editor: E,
  options?: { width?: string } & InsertNodesOptions<ValueOf<E>>
) => {
  const width = options?.width || '33%';

  insertNodes<TColumnElement>(
    editor,
    {
      children: [{ children: [{ text: '' }], type: ELEMENT_DEFAULT }],
      type: ELEMENT_COLUMN,
      width,
    },
    getQueryOptions(editor, options)
  );
};
