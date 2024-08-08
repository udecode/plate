import {
  ELEMENT_DEFAULT,
  type InsertNodesOptions,
  type PlateEditor,
  type Value,
  getQueryOptions,
  insertNodes,
} from '@udecode/plate-common/server';

import type { TColumnElement } from '../types';

import { ELEMENT_COLUMN } from '../ColumnPlugin';

export const insertEmptyColumn = <V extends Value>(
  editor: PlateEditor<V>,
  options?: { width?: string } & InsertNodesOptions<V>
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
