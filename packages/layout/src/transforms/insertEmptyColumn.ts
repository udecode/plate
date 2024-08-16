import {
  type InsertNodesOptions,
  ParagraphPlugin,
  type PlateEditor,
  getQueryOptions,
  insertNodes,
} from '@udecode/plate-common';

import type { TColumnElement } from '../types';

import { ColumnItemPlugin } from '../ColumnPlugin';

export const insertEmptyColumn = <E extends PlateEditor>(
  editor: E,
  options?: { width?: string } & InsertNodesOptions<E>
) => {
  const width = options?.width || '33%';

  insertNodes<TColumnElement>(
    editor,
    {
      children: [{ children: [{ text: '' }], type: ParagraphPlugin.key }],
      type: ColumnItemPlugin.key,
      width,
    },
    getQueryOptions(editor, options)
  );
};
